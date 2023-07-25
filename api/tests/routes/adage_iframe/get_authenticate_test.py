import datetime
from typing import ByteString
from typing import Optional

import pytest

from pcapi.core.educational.factories import EducationalInstitutionFactory
from pcapi.core.educational.factories import EducationalRedactorFactory

from tests.conftest import TestClient
from tests.routes.adage_iframe.utils_create_test_token import create_adage_jwt_default_fake_valid_token
from tests.routes.adage_iframe.utils_create_test_token import create_adage_jwt_fake_invalid_token
from tests.routes.adage_iframe.utils_create_test_token import create_adage_jwt_fake_valid_token


@pytest.mark.usefixtures("db_session")
class AuthenticateTest:
    valid_user = {
        "mail": "sabine.laprof@example.com",
        "uai": "EAU123",
    }

    def _create_adage_valid_token(self, uai_code: Optional[str]) -> ByteString:
        return create_adage_jwt_default_fake_valid_token(
            civility=self.valid_user.get("civilite"),
            lastname=self.valid_user.get("nom"),
            firstname=self.valid_user.get("prenom"),
            email=self.valid_user.get("mail"),
            uai=uai_code,
        )

    def test_should_return_redactor_role_when_token_has_an_uai_code(self, app) -> None:
        # Given
        EducationalRedactorFactory(email=self.valid_user.get("mail"))
        EducationalInstitutionFactory(
            institutionId=self.valid_user.get("uai"),
            name="BELLEVUE",
            institutionType="COLLEGE",
            postalCode="30100",
            city="Ales",
        )
        valid_encoded_token = self._create_adage_valid_token(uai_code=self.valid_user.get("uai"))

        test_client = TestClient(app.test_client())
        test_client.auth_header = {"Authorization": f"Bearer {valid_encoded_token}"}

        # When
        response = test_client.get("/adage-iframe/authenticate")

        # Then
        assert response.status_code == 200
        assert response.json == {
            "role": "redactor",
            "uai": "EAU123",
            "departmentCode": "30",
            "institutionName": "COLLEGE BELLEVUE",
            "institutionCity": "Ales",
            "email": "sabine.laprof@example.com",
            "preferences": {"feedback_form_closed": None},
        }

    def test_preferences_are_correctly_serialized(self, client) -> None:
        educational_institution = EducationalInstitutionFactory()
        educational_redactor = EducationalRedactorFactory(preferences={"feedback_form_closed": True})

        client = client.with_adage_token(email=educational_redactor.email, uai=educational_institution.institutionId)
        response = client.get("/adage-iframe/authenticate")

        # Then
        assert response.status_code == 200
        assert response.json["preferences"] == {"feedback_form_closed": True}

    def test_should_return_readonly_role_when_token_has_no_uai_code(self, app) -> None:
        # Given
        valid_encoded_token = self._create_adage_valid_token(uai_code=None)

        test_client = TestClient(app.test_client())
        test_client.auth_header = {"Authorization": f"Bearer {valid_encoded_token}"}

        # When
        response = test_client.get("/adage-iframe/authenticate")

        # Then
        assert response.status_code == 200
        assert response.json == {
            "role": "readonly",
            "uai": None,
            "departmentCode": None,
            "institutionName": None,
            "institutionCity": None,
            "email": None,
            "preferences": None,
        }

    valid_user = {
        "civilite": "Mme.",
        "nom": "LAPROF",
        "prenom": "Sabine",
        "mail": "sabine.laprof@example.com",
        "uai": "EAU123",
    }

    def _create_adage_valid_token_from_expiration_date(
        self, expiration_date: Optional[datetime.datetime]
    ) -> ByteString:
        return create_adage_jwt_fake_valid_token(
            civility=self.valid_user.get("civilite"),
            lastname=self.valid_user.get("nom"),
            firstname=self.valid_user.get("prenom"),
            email=self.valid_user.get("mail"),
            uai=self.valid_user.get("uai"),
            expiration_date=expiration_date,
        )

    @staticmethod
    def _create_adage_invalid_token() -> ByteString:
        return create_adage_jwt_fake_invalid_token(
            civility="M.", lastname="TESTABLE", firstname="Pascal", email="pascal.testable@example.com", uai="321UAE"
        )

    def test_should_return_error_response_when_jwt_invalid(self, app):
        # Given
        corrupted_token = self._create_adage_invalid_token()

        test_client = TestClient(app.test_client())
        test_client.auth_header = {"Authorization": f"Bearer {corrupted_token}"}

        # When
        response = test_client.get("/adage-iframe/authenticate")

        # Then
        assert response.status_code == 403
        assert "Unrecognized token" in response.json["Authorization"]

    def test_should_return_error_response_when_jwt_expired(self, app):
        # Given
        now = datetime.datetime.utcnow()
        expired_token = self._create_adage_valid_token_from_expiration_date(
            expiration_date=now - datetime.timedelta(days=1)
        )

        test_client = TestClient(app.test_client())
        test_client.auth_header = {"Authorization": f"Bearer {expired_token}"}

        # When
        response = test_client.get("/adage-iframe/authenticate")

        # Then
        assert response.status_code == 422
        assert "Token expired" in response.json["msg"]

    def test_should_return_error_response_when_no_expiration_date_in_token(self, app):
        # Given
        no_expiration_date_token = self._create_adage_valid_token_from_expiration_date(expiration_date=None)

        test_client = TestClient(app.test_client())
        test_client.auth_header = {"Authorization": f"Bearer {no_expiration_date_token}"}

        # When
        response = test_client.get("/adage-iframe/authenticate")

        # Then
        assert response.status_code == 422
        assert "No expiration date provided" in response.json["msg"]
