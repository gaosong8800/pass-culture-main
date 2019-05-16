from datetime import datetime
import pytest

from models import PcObject
from scripts.payment.batch_steps import generate_new_payments
from tests.conftest import clean_database, TestClient
from tests.test_utils import API_URL, create_bank_information, create_stock_with_thing_offer, \
    create_offer_with_thing_product, create_deposit, create_stock_with_event_offer, create_venue, create_offerer, \
    create_recommendation, create_user, create_booking, create_offer_with_event_product, \
    create_event_occurrence, create_stock_from_event_occurrence, create_user_offerer

@pytest.mark.standalone
class GetReimbursementsCsvTest:
    @clean_database
    def test_get_reimbursements_csv(self, app):
        # Given
        user = create_user(email='user+plus@email.fr')
        deposit = create_deposit(user, datetime.utcnow(), amount=500, source='public')
        offerer1 = create_offerer()
        offerer2 = create_offerer(siren='123456788')
        user_offerer1 = create_user_offerer(user, offerer1, validation_token=None)
        user_offerer2 = create_user_offerer(user, offerer2, validation_token=None)
        venue1 = create_venue(offerer1)
        venue2 = create_venue(offerer1, siret='12345678912346')
        venue3 = create_venue(offerer2, siret='12345678912347')
        bank_information1 = create_bank_information(id_at_providers='79387501900056', venue=venue1)
        bank_information2 = create_bank_information(id_at_providers='79387501900057', venue=venue2)

        offer1 = create_offer_with_thing_product(venue1, url='https://host/path/{token}?offerId={offerId}&email={email}')
        offer2 = create_offer_with_thing_product(venue2)
        offer3 = create_offer_with_thing_product(venue3)
        offer4 = create_offer_with_thing_product(venue3)
        stock1 = create_stock_with_thing_offer(offerer=offerer1, venue=venue1, price=10)
        stock2 = create_stock_with_thing_offer(offerer=offerer1, venue=venue2, price=11)
        stock3 = create_stock_with_thing_offer(offerer=offerer2, venue=venue3, price=12)
        stock4 = create_stock_with_thing_offer(offerer=offerer2, venue=venue3, price=13)
        booking1 = create_booking(user, stock1, venue=venue1, token='ABCDEF', is_used=True)
        booking2 = create_booking(user, stock1, venue=venue1, token='ABCDEG')
        booking3 = create_booking(user, stock2, venue=venue2, token='ABCDEH', is_used=True)
        booking4 = create_booking(user, stock3, venue=venue3, token='ABCDEI', is_used=True)
        booking5 = create_booking(user, stock4, venue=venue3, token='ABCDEJ', is_used=True)
        booking6 = create_booking(user, stock4, venue=venue3, token='ABCDEK', is_used=True)
        PcObject.check_and_save(deposit, booking1, booking2, booking3,
                                booking4, booking5, booking6, user_offerer1,
                                user_offerer2, bank_information1, bank_information2)
        generate_new_payments()

        # When
        response = TestClient().with_auth(user.email).get(
            API_URL + '/reimbursements/csv')
        response_lines = response.text.split('\n')

        # Then
        assert response.status_code == 200
        assert response.headers['Content-type'] == 'text/csv; charset=utf-8;'
        assert response.headers['Content-Disposition'] == 'attachment; filename=remboursements_pass_culture.csv'
        assert len(response_lines) == 7

    @clean_database
    def test_get_reimbursements_csv_no_user_offerer(self, app):
        # Given
        user = create_user(email='user+plus@email.fr')
        PcObject.check_and_save(user)

        # When
        response = TestClient().with_auth(user.email).get(
            API_URL + '/reimbursements/csv')
        response_lines = response.text.split('\n')

        # Then
        assert response.status_code == 200
        assert len(response_lines) == 2
