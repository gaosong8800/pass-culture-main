from datetime import datetime

import pytest

from pcapi.core.educational.factories import CollectiveOfferFactory
from pcapi.core.educational.factories import create_collective_offer_by_status
from pcapi.core.educational.models import CollectiveOffer
from pcapi.core.educational.models import CollectiveOfferDisplayedStatus
import pcapi.core.offerers.factories as offerers_factories
from pcapi.core.testing import assert_num_queries
from pcapi.models import db


@pytest.mark.usefixtures("db_session")
class Returns204Test:
    def when_archiving_existing_offers(self, client):
        # Given
        offer1 = CollectiveOfferFactory()
        venue = offer1.venue
        offer2 = CollectiveOfferFactory(venue=venue)
        offerer = venue.managingOfferer
        offerers_factories.UserOffererFactory(user__email="pro@example.com", offerer=offerer)
        client = client.with_session_auth("pro@example.com")

        # When
        data = {"ids": [offer1.id, offer2.id]}

        # query += 1 authentication
        # query += 1 load current_user
        # query += 1 ensure there is no existing archived offer
        # query += 1 retrieve all collective_order.ids to batch them in pool for update
        # query += 1 update dateArchive on collective_offer
        with assert_num_queries(5):
            response = client.patch("/collective/offers/archive", json=data)
            assert response.status_code == 204

        # Then
        db.session.refresh(offer1)
        assert offer1.isArchived
        assert not offer1.isActive
        db.session.refresh(offer2)
        assert offer2.isArchived
        assert not offer2.isActive

    def when_archiving_existing_offers_from_other_offerer(self, client):
        # Given
        offer = CollectiveOfferFactory()
        venue = offer.venue
        offerer = venue.managingOfferer

        other_offer = CollectiveOfferFactory()
        other_venue = other_offer.venue
        other_offerer = other_venue.managingOfferer

        # Ensure that the offerer is different
        assert other_offerer.id != offerer.id

        offerers_factories.UserOffererFactory(user__email="pro@example.com", offerer=offerer)
        client = client.with_session_auth("pro@example.com")

        # When
        data = {"ids": [offer.id, other_offer.id]}

        response = client.patch("/collective/offers/archive", json=data)

        # Then
        assert response.status_code == 204
        db.session.refresh(offer)
        assert offer.isArchived
        assert not offer.isActive
        db.session.refresh(other_offer)
        assert not other_offer.isArchived
        assert other_offer.isActive

    def when_archiving_draft_offers(self, client):
        # Given
        draft_offer = create_collective_offer_by_status(CollectiveOfferDisplayedStatus.DRAFT)
        venue = draft_offer.venue
        other_offer = CollectiveOfferFactory(venue=venue)
        offerer = venue.managingOfferer
        offerers_factories.UserOffererFactory(user__email="pro@example.com", offerer=offerer)
        client = client.with_session_auth("pro@example.com")

        # When
        data = {"ids": [draft_offer.id, other_offer.id]}

        # query += 1 authentication
        # query += 1 load current_user
        # query += 1 ensure there is no existing archived offer
        # query += 1 retrieve all collective_order.ids to batch them in pool for update
        # query += 1 update dateArchive on collective_offer
        with assert_num_queries(5):
            response = client.patch("/collective/offers/archive", json=data)
            assert response.status_code == 204

        # Then
        db.session.refresh(draft_offer)
        assert draft_offer.isArchived
        assert not draft_offer.isActive
        db.session.refresh(other_offer)
        assert other_offer.isArchived
        assert not other_offer.isActive

    def test_archive_rejected_offer(self, client):
        # Given
        offer = create_collective_offer_by_status(CollectiveOfferDisplayedStatus.REJECTED)
        venue = offer.venue
        offerer = venue.managingOfferer
        offerers_factories.UserOffererFactory(user__email="pro@example.com", offerer=offerer)
        client = client.with_session_auth("pro@example.com")

        # When
        data = {"ids": [offer.id]}

        # query += 1 authentication
        # query += 1 load current_user
        # query += 1 ensure there is no existing archived offer
        # query += 1 retrieve all collective_order.ids to batch them in pool for update
        # query += 1 update dateArchive on collective_offer
        with assert_num_queries(5):
            response = client.patch("/collective/offers/archive", json=data)
            assert response.status_code == 204

        # Then
        db.session.refresh(offer)
        assert offer.isArchived
        assert not offer.isActive


@pytest.mark.usefixtures("db_session")
class Returns422Test:
    def when_archiving_already_archived(self, client):
        # Given
        offer_already_archived = CollectiveOfferFactory(isActive=False, dateArchived=datetime.utcnow())
        venue = offer_already_archived.venue
        offer_not_archived = CollectiveOfferFactory(venue=venue)
        offerer = venue.managingOfferer
        offerers_factories.UserOffererFactory(user__email="pro@example.com", offerer=offerer)
        client = client.with_session_auth("pro@example.com")

        # When
        data = {"ids": [offer_already_archived.id, offer_not_archived.id]}

        response = client.patch("/collective/offers/archive", json=data)

        # Then
        assert response.status_code == 422
        assert response.json == {"global": ["One of the offers is already archived"]}

        assert CollectiveOffer.query.get(offer_already_archived.id).isArchived
        assert not CollectiveOffer.query.get(offer_not_archived.id).isArchived
