import csv
import datetime
import json
import logging

import pydantic.v1 as pydantic_v1
from sqlalchemy.orm import joinedload

from pcapi.core.history import api as history_api
from pcapi.core.history import models as history_models
from pcapi.core.offerers import models as offerers_models
from pcapi.core.providers import api as providers_api
from pcapi.core.providers import models as providers_models
from pcapi.core.users import models as users_models
from pcapi.models import db
from pcapi.repository import transaction
from pcapi.utils.date import utc_datetime_to_department_timezone


logger = logging.getLogger(__name__)


BACKEND_USER_ID = 2568200  # id of our backend tech lead user

_PATH_TO_MIGRATION_JSON = "./src/pcapi/scripts/provider_migration/data/migration.json"
_TARGET_HOUR_FORMAT = "%HH"
_TARGET_DAY_FORMAT = "%d/%m/%y"


class MigrationJsonGenerationException(Exception):
    pass


class CsvRowException(Exception):
    pass


def _load_migration_json() -> dict:
    data = {}
    with open(_PATH_TO_MIGRATION_JSON, "r", encoding="UTF-8") as f:
        data = json.load(f)

    return data


def _dump_migration_json(json_dict: dict) -> None:
    with open(_PATH_TO_MIGRATION_JSON, "w", encoding="UTF-8") as f:
        json.dump(json_dict, f, indent=4)


def _parse_row(row: list[str]) -> tuple[int, str, str]:
    if len(row) != 3:
        raise CsvRowException(f"Expected 3 elements, got {len(row)}")

    venue_id, target_day, target_hour = row

    try:
        int(venue_id)
    except ValueError:
        raise CsvRowException(f"Column 1 - expected int, got {venue_id}")

    try:
        datetime.datetime.strptime(target_day, _TARGET_DAY_FORMAT)
    except ValueError:
        raise CsvRowException(f"Column 2 - expected date in format `{_TARGET_DAY_FORMAT}`, got {target_day}")

    try:
        datetime.datetime.strptime(target_hour, _TARGET_HOUR_FORMAT)
    except ValueError:
        raise CsvRowException(f"Column 3 - expected hour in format `{_TARGET_HOUR_FORMAT}`, got {target_hour}")

    return int(venue_id), target_day, target_hour


def sort_date_keys(date_string: str) -> float:
    return datetime.datetime.strptime(date_string, _TARGET_DAY_FORMAT).timestamp()


def generate_migration_json_from_csv(path: str, provider_id: int, comment: str) -> None:
    """
    Generate JSON file that contained scheduled migrations

    :path         : Path to CSV file that should have the following structure :
                        # venue_id, date in format `"%d/%m/%y`, hour in format `%HH`
                        3185,21/10/24,14H
                        4306,21/10/24,10H
                        #...
    :provider_id  : Id of target provider
    :comment      : Comment that will be added in ActionHistory, for instance:
                    `(PC-32205) Migrate bookshops using Librisoft to new API for stock update.`
    """
    migration_dict = _load_migration_json()

    with open(path, "r", encoding="UTF-8", newline="") as csvfile:
        reader = csv.reader(csvfile, delimiter=",")
        for row_number, row in enumerate(reader, start=1):
            try:
                venue_id, target_day, target_hour = _parse_row(row)
            except CsvRowException as e:
                raise MigrationJsonGenerationException(f"Row {row_number} - {str(e)}")

            # Get existing value or initialize dicts
            day_dict = migration_dict.get(target_day, {})
            hour_dict = day_dict.get(
                target_hour,
                {
                    "target_provider_id": provider_id,
                    "comment": comment,
                    "venues_ids": [],
                },  # initial values
            )

            if hour_dict["target_provider_id"] != provider_id:
                raise MigrationJsonGenerationException(
                    f"Another provider (Provider #{hour_dict['target_provider_id']}) already has a migration scheduled for this time slot ({target_day} - {target_hour})"
                )

            # Update values
            if venue_id not in hour_dict["venues_ids"]:
                hour_dict["venues_ids"].append(int(venue_id))

            day_dict[target_hour] = hour_dict
            migration_dict[target_day] = day_dict

    # order keys
    ordered_migration = dict(sorted(migration_dict.items(), key=lambda item: sort_date_keys(item[0])))

    _dump_migration_json(ordered_migration)


class MigrationData(pydantic_v1.BaseModel):
    target_provider_id: int
    venues_ids: list[int]
    comment: str


def get_migration_date_and_hour_keys() -> tuple[str, str]:
    """
    Format current datetime to tuple `target_day`, `target_hour`.
    """
    now_utc = datetime.datetime.utcnow()
    now_in_paris_tz = utc_datetime_to_department_timezone(now_utc, departement_code="75")
    today = now_in_paris_tz.strftime("%d/%m/%y")
    one_hour_from_now = now_in_paris_tz + datetime.timedelta(hours=1)
    target_hour = one_hour_from_now.strftime("%HH")
    return today, target_hour


def execute_scheduled_venue_provider_migration(target_day: str, target_hour: str) -> None:
    """
    Execute VenueProvider migration scheduled for `target_day` at `target_hour`

    :target_day  : Expected format `%d/%m/%y`, for instance: `07/10/24`
    :target_hour : Expected format `%HH`, for instance: `10H`
    """
    venues_to_migrate_by_date_and_hour = _load_migration_json()
    logging_message, migration_data = _retrieve_migration_data(
        venues_to_migrate_by_date_and_hour,
        target_day=target_day,
        target_hour=target_hour,
    )
    logger.info(logging_message)

    if migration_data:
        # Check provider exists
        provider = providers_models.Provider.query.get(migration_data.target_provider_id)
        if not provider:
            logger.error("[❌ MIGRATION ABORTED] No provider was found for id %s", migration_data.target_provider_id)
            return

        # Check all venues exist
        missing_venues_ids = _look_for_missing_venues(migration_data.venues_ids)
        if missing_venues_ids:
            logger.error(
                "[❌ MIGRATION ABORTED] Some venues don't exist %s", ", ".join([str(id) for id in missing_venues_ids])
            )
            return

        _migrate_venue_providers(
            provider_id=provider.id,
            venues_ids=migration_data.venues_ids,
            migration_author=users_models.User.query.get(BACKEND_USER_ID),
            comment=migration_data.comment,
        )


def _retrieve_migration_data(
    data: dict, target_day: str, target_hour: str
) -> tuple[str, None] | tuple[str, MigrationData]:
    """
    Return a logging message and `MigrationData` object if there is data set fo given `target_day`
    at given `target_hour`

    :data        : A dict with the following structure
                   {
                       "%d/%m/%y": {
                           "%HH": {
                               "target_provider_id": int,
                               "venues_ids": list[int],
                               "comment": str,
                            }
                        }
                        # etc...
                    }
                    For instance :
                    {
                       "07/10/24": {
                           "10H": {
                               "target_provider_id": 42,
                               "venues_ids": [1, 2, 4],
                               "comment": "Migration to provider X",
                            },
                            # etc...
                        }
                    }
    :target_day  : Expected format `%d/%m/%y`, for instance: `07/10/24`
    :target_hour : Expected format `%HH`, for instance: `10H`
    """
    venues_to_migrate_today = data.get(target_day)
    if not venues_to_migrate_today:
        return f"({target_day}) No venues to migrate today", None

    migration_data = venues_to_migrate_today.get(target_hour)
    if not migration_data:
        return f"({target_day} - {target_hour}) No venues to migrate at this time of day", None

    migration_data = MigrationData(**migration_data)
    return (
        f"({target_day} - {target_hour}) {len(migration_data.venues_ids)} venues to migrate to provider #{migration_data.target_provider_id}",
        migration_data,
    )


def _look_for_missing_venues(venues_ids: list[int]) -> list[int]:
    """
    Return a list of venues ids not found in DB
    """
    venues = offerers_models.Venue.query.filter(offerers_models.Venue.id.in_(venues_ids)).all()

    if len(venues) != len(venues_ids):
        found_venues_ids = [venue.id for venue in venues]
        return [id for id in venues_ids if id not in found_venues_ids]

    return []


def _delete_venue_provider(
    venue_provider: providers_models.VenueProvider,
    author: users_models.User,
    comment: str,
) -> None:
    """
    Delete existing VenueProvider and add corresponding action in the ActionHistory table
    """
    venue_id = venue_provider.venueId
    provider_id = venue_provider.provider.id
    history_api.add_action(
        history_models.ActionType.LINK_VENUE_PROVIDER_DELETED,
        author=author,
        venue=venue_provider.venue,
        provider_id=venue_provider.providerId,
        provider_name=venue_provider.provider.name,
        comment=comment,
    )
    db.session.delete(venue_provider)
    logger.info(
        "Deleted VenueProvider for venue %d",
        venue_id,
        extra={"venue_id": venue_id, "provider_id": provider_id},
        technical_message_id="offer.sync.deleted",
    )


def _migrate_venue_providers(
    provider_id: int,
    venues_ids: list[int],
    migration_author: users_models.User,
    comment: str,
) -> None:
    """
    Migrate a list of venues to a new provider.

    Migrating a venue is a two steps process:
        1. Delete existing VenueProviders (but do not deactivate existing offers)
        2. Insert new VenueProvider (for given provider)
    """
    venues = (
        offerers_models.Venue.query.filter(offerers_models.Venue.id.in_(venues_ids))
        .options(joinedload(offerers_models.Venue.venueProviders))
        .all()
    )

    with transaction():
        for venue in venues:
            logger.info("Handling venue <#%s - %s>", venue.id, venue.name)
            if len(venue.venueProviders):
                for venue_provider in venue.venueProviders:
                    _delete_venue_provider(venue_provider, author=migration_author, comment=comment)
            providers_api.create_venue_provider(provider_id, venue.id, current_user=migration_author)
