# This is another duplication of the industrial sandbox, but it is temporary
# and will be deleted when all needed data will be created with specific routes
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_app_users import *
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_bank_accounts import create_e2e_bank_accounts
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_bookings import *
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_commercial_gestures import create_e2e_commercial_gestures
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_complex_offers import create_complex_offers
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_draft_offers import create_e2e_draft_offers
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_eac_data import create_eac_data
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_event_occurrences import *
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_event_offers import *
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_event_stocks import *
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_incidents import create_e2e_incidents
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_individual_offerers import create_e2e_individual_offerers
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_invoices import *
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_iris import create_iris
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_offer_price_limitation_rules import *
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_offer_validation_rules import *
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_offerer_addresses import create_e2e_offerer_addresses
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_offerer_confidence_rules import *
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_offerer_tags import create_e2e_offerer_tags
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_offerers import *
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_pro_users import *
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_pro_users_api_keys import *
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_search_objects import create_e2e_search_indexed_objects
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_thing_offers import *
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_thing_stocks import *
from pcapi.sandboxes.scripts.creators.e2e.create_e2e_venues import *
from pcapi.sandboxes.scripts.creators.e2e.create_offer_with_thousand_stocks import create_offer_with_thousand_stocks
from pcapi.sandboxes.scripts.creators.e2e.create_offerer_providers_for_apis import create_offerer_providers_for_apis
from pcapi.sandboxes.scripts.creators.e2e.create_offerer_with_several_venues import create_offerer_with_several_venues
from pcapi.sandboxes.scripts.creators.e2e.create_offerer_with_venue_provider_and_external_bookings import (
    create_e2e_provider_external_bookings,
)
from pcapi.sandboxes.scripts.creators.e2e.create_offers_with_ean import create_offers_with_ean
from pcapi.sandboxes.scripts.creators.e2e.create_offers_with_price_categories import create_offers_with_price_categories
from pcapi.sandboxes.scripts.creators.e2e.create_offers_with_status import create_offers_with_status


def save_e2e_sandbox() -> None:
    create_iris()
    offerers_by_name = create_e2e_offerers()

    pro_users_by_name = create_e2e_pro_users(offerers_by_name)
    app_users_by_name = create_e2e_app_users()

    users_by_name = dict(dict(**pro_users_by_name), **app_users_by_name)

    venues_by_name = create_e2e_venues(offerers_by_name)

    event_offers_by_name = create_e2e_event_offers(offerers_by_name)

    thing_offers_by_name = create_e2e_thing_offers(offerers_by_name, venues_by_name)

    create_e2e_draft_offers(offerers_by_name)

    offers_by_name = dict(event_offers_by_name, **thing_offers_by_name)

    event_occurrences_by_name = create_e2e_event_occurrences(event_offers_by_name)

    create_e2e_event_stocks(event_occurrences_by_name)

    create_e2e_thing_stocks(thing_offers_by_name)

    create_e2e_bookings(offers_by_name, users_by_name)

    create_complex_offers(offerers_by_name)

    create_eac_data()

    # Now that they booked, we can expire these users' deposit.
    for name, user in users_by_name.items():
        if "has-booked-some-but-deposit-expired" in name:
            assert user.deposit  # helps mypy
            user.deposit.expirationDate = datetime.utcnow()
            repository.save(user.deposit)

    create_e2e_invoices()

    create_e2e_pro_users_api_keys(offerers_by_name)

    create_e2e_search_indexed_objects()

    create_e2e_provider_external_bookings()

    create_e2e_offerer_tags()

    offerer_with_several_venues = create_offerer_with_several_venues()

    create_offers_with_status(offerer_with_several_venues)

    create_offer_with_thousand_stocks(offerer_with_several_venues)

    create_offers_with_price_categories(offerer_with_several_venues)

    create_offerer_providers_for_apis()

    create_offers_with_ean()

    create_e2e_incidents()

    create_e2e_individual_offerers()

    create_e2e_bank_accounts()

    create_e2e_offerer_addresses()

    create_e2e_offerer_confidence_rules()

    create_e2e_commercial_gestures()
