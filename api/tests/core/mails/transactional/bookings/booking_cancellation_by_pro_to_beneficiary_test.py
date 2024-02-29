from datetime import datetime
from datetime import timezone
import decimal

import pytest

import pcapi.core.bookings.factories as bookings_factories
from pcapi.core.mails import models
import pcapi.core.mails.testing as mails_testing
from pcapi.core.mails.transactional.bookings.booking_cancellation_by_pro_to_beneficiary import (
    get_booking_cancellation_by_pro_to_beneficiary_email_data,
)
from pcapi.core.mails.transactional.bookings.booking_cancellation_by_pro_to_beneficiary import (
    send_booking_cancellation_by_pro_to_beneficiary_email,
)
from pcapi.core.mails.transactional.sendinblue_template_ids import TransactionalEmail
import pcapi.core.offers.factories as offers_factories


@pytest.mark.usefixtures("db_session")
class SendinblueSendWarningToBeneficiaryAfterProBookingCancellationTest:
    def test_should_sends_email_to_beneficiary_when_pro_cancels_booking(self):
        # Given
        booking = bookings_factories.BookingFactory(
            user__email="user@example.com",
            user__firstName="Jeanne",
        )

        # When
        send_booking_cancellation_by_pro_to_beneficiary_email(booking)

        # Then
        assert (
            mails_testing.outbox[0]["template"]
            == TransactionalEmail.BOOKING_CANCELLATION_BY_PRO_TO_BENEFICIARY.value.__dict__
        )
        assert mails_testing.outbox[0]["To"] == "user@example.com"
        assert mails_testing.outbox[0]["params"] == {
            "EVENT_DATE": None,
            "EVENT_HOUR": None,
            "IS_EVENT": False,
            "IS_EXTERNAL": False,
            "IS_FREE_OFFER": False,
            "IS_THING": True,
            "IS_ONLINE": False,
            "OFFER_NAME": booking.stock.offer.name,
            "OFFER_PRICE": decimal.Decimal("10.10"),
            "OFFERER_NAME": booking.offerer.name,
            "USER_FIRST_NAME": "Jeanne",
            "USER_LAST_NAME": "Doux",
            "VENUE_NAME": booking.venue.name,
            "REJECTED": False,
        }


@pytest.mark.usefixtures("db_session")
class SendinblueRetrieveDataToWarnUserAfterProBookingCancellationTest:
    def test_should_return_event_data_when_booking_is_on_an_event(self):
        # Given
        stock = offers_factories.EventStockFactory(
            beginningDatetime=datetime(2019, 7, 20, 12, 0, 0, tzinfo=timezone.utc)
        )
        booking = bookings_factories.BookingFactory(
            stock=stock,
            user__firstName="Georges",
            user__lastName="Moustiquos",
        )

        # When
        email_data = get_booking_cancellation_by_pro_to_beneficiary_email_data(booking, is_gcu_incompatible=False)

        # Then
        assert email_data.params == {
            "EVENT_DATE": "samedi 20 juillet 2019",
            "EVENT_HOUR": "14h",
            "IS_EVENT": True,
            "IS_EXTERNAL": False,
            "IS_FREE_OFFER": False,
            "IS_ONLINE": False,
            "IS_THING": False,
            "OFFER_NAME": booking.stock.offer.name,
            "OFFER_PRICE": decimal.Decimal("10.10"),
            "OFFERER_NAME": booking.offerer.name,
            "USER_FIRST_NAME": "Georges",
            "USER_LAST_NAME": "Moustiquos",
            "VENUE_NAME": booking.venue.name,
            "REJECTED": False,
        }

    def test_should_return_thing_data_when_booking_is_on_a_thing(self):
        # Given
        stock = offers_factories.ThingStockFactory()
        booking = bookings_factories.BookingFactory(
            stock=stock,
            user__firstName="Georges",
            user__lastName="Doux",
        )

        # When
        email_data = get_booking_cancellation_by_pro_to_beneficiary_email_data(booking, is_gcu_incompatible=False)

        # Then
        assert email_data.template == models.Template(
            id_prod=225, id_not_prod=37, tags=["jeunes_offre_annulee_pros"], send_to_ehp=False
        )
        assert email_data.params == {
            "EVENT_DATE": None,
            "EVENT_HOUR": None,
            "IS_EVENT": False,
            "IS_EXTERNAL": False,
            "IS_FREE_OFFER": False,
            "IS_ONLINE": False,
            "IS_THING": True,
            "OFFER_NAME": booking.stock.offer.name,
            "OFFER_PRICE": decimal.Decimal("10.10"),
            "OFFERER_NAME": booking.offerer.name,
            "USER_FIRST_NAME": "Georges",
            "USER_LAST_NAME": "Doux",
            "VENUE_NAME": booking.venue.name,
            "REJECTED": False,
        }

    def test_should_return_thing_data_when_booking_is_on_an_online_offer(self):
        # Given
        stock = offers_factories.ThingStockFactory(offer=offers_factories.DigitalOfferFactory())
        booking = bookings_factories.BookingFactory(
            stock=stock,
            user__firstName="Georges",
            user__lastName="Georges",
        )

        # When
        email_data = get_booking_cancellation_by_pro_to_beneficiary_email_data(booking, is_gcu_incompatible=False)

        # Then
        assert email_data.params == {
            "EVENT_DATE": None,
            "EVENT_HOUR": None,
            "IS_EVENT": False,
            "IS_EXTERNAL": False,
            "IS_FREE_OFFER": False,
            "IS_ONLINE": True,
            "IS_THING": False,
            "OFFER_NAME": booking.stock.offer.name,
            "OFFER_PRICE": decimal.Decimal("10.10"),
            "OFFERER_NAME": booking.offerer.name,
            "USER_FIRST_NAME": "Georges",
            "USER_LAST_NAME": "Georges",
            "VENUE_NAME": booking.venue.name,
            "REJECTED": False,
        }

    def test_should_not_display_the_price_when_booking_is_on_a_free_offer(self):
        # Given
        booking = bookings_factories.BookingFactory(
            stock__price=0,
            user__firstName="Georges",
        )

        # When
        sendiblue_data = get_booking_cancellation_by_pro_to_beneficiary_email_data(booking, is_gcu_incompatible=False)

        # Then
        assert sendiblue_data.params["IS_FREE_OFFER"] is True
        assert sendiblue_data.params["OFFER_PRICE"] == 0.00

    def test_should_display_the_price_multiplied_by_quantity_when_it_is_a_duo_offer(self):
        # Given
        booking = bookings_factories.BookingFactory(
            amount=10,
            quantity=2,
            user__firstName="Georges",
        )

        # When
        sendiblue_data = get_booking_cancellation_by_pro_to_beneficiary_email_data(booking, is_gcu_incompatible=False)

        # Then
        assert sendiblue_data.params["IS_FREE_OFFER"] is False
        assert sendiblue_data.params["OFFER_PRICE"] == 20.00
