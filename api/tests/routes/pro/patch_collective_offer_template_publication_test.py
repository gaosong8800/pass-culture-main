import pytest

from pcapi.core.educational import factories as educational_factories
from pcapi.core.educational import models as educational_models
from pcapi.core.offerers import factories as offerers_factories
from pcapi.core.offers import api as offers_api
from pcapi.models.offer_mixin import OfferValidationStatus
from pcapi.utils.human_ids import humanize


SIMPLE_OFFER_VALIDATION_CONFIG = """
        minimum_score: 0.6
        rules:
            - name: "check offer name"
              factor: 0
              conditions:
               - model: "CollectiveOfferTemplate"
                 attribute: "name"
                 condition:
                    operator: "contains"
                    comparated:
                      - "suspicious"
        """


@pytest.mark.usefixtures("db_session")
class Returns204Test:
    def expect_offer_to_be_approved(self, client):
        offer = educational_factories.CollectiveOfferTemplateFactory(validation=OfferValidationStatus.DRAFT)
        user_offerer = offerers_factories.UserOffererFactory(offerer=offer.venue.managingOfferer)

        url = f"/collective/offers-template/{humanize(offer.id)}/publish"

        response = client.with_session_auth(user_offerer.user.email).patch(url)

        assert response.status_code == 200
        assert response.json["validation"] == OfferValidationStatus.APPROVED

    def expect_offer_to_be_pending(self, client):
        offer = educational_factories.CollectiveOfferTemplateFactory(
            name="suspicious", validation=OfferValidationStatus.DRAFT
        )
        user_offerer = offerers_factories.UserOffererFactory(offerer=offer.venue.managingOfferer)

        url = f"/collective/offers-template/{humanize(offer.id)}/publish"
        offers_api.import_offer_validation_config(SIMPLE_OFFER_VALIDATION_CONFIG)

        response = client.with_session_auth(user_offerer.user.email).patch(url)

        assert response.status_code == 200
        assert response.json["validation"] == OfferValidationStatus.PENDING
        assert not response.json["isActive"]


@pytest.mark.usefixtures("db_session")
class Returns403Test:
    def expect_offer_to_be_approved(self, client):
        offer = educational_factories.CollectiveOfferTemplateFactory(validation=OfferValidationStatus.DRAFT)
        user_offerer = offerers_factories.UserOffererFactory()

        url = f"/collective/offers-template/{humanize(offer.id)}/publish"

        response = client.with_session_auth(user_offerer.user.email).patch(url)

        assert response.status_code == 403
        offer = educational_models.CollectiveOfferTemplate.query.filter_by(id=offer.id).one()
        assert offer.validation == OfferValidationStatus.DRAFT


@pytest.mark.usefixtures("db_session")
class Returns401Test:
    def expect_offer_to_be_approved(self, client):
        offer = educational_factories.CollectiveOfferTemplateFactory(validation=OfferValidationStatus.DRAFT)

        url = f"/collective/offers-template/{humanize(offer.id)}/publish"

        response = client.patch(url)

        assert response.status_code == 401
        offer = educational_models.CollectiveOfferTemplate.query.filter_by(id=offer.id).one()
        assert offer.validation == OfferValidationStatus.DRAFT
