import datetime
from unittest.mock import patch

import time_machine

from pcapi.connectors.dms import api as api_dms
from pcapi.connectors.dms import models as dms_models

from tests.scripts.beneficiary.fixture import make_graphql_application
from tests.scripts.beneficiary.fixture import make_graphql_deleted_applications
from tests.scripts.beneficiary.fixture import make_single_application


class GraphqlResponseTest:
    @patch.object(api_dms.DMSGraphQLClient, "execute_query")
    def test_get_applications_with_details(self, execute_query):
        execute_query.side_effect = [
            make_graphql_application(123, "accepte", full_graphql_response=True, has_next_page=True),
            make_graphql_application(456, "accepte", full_graphql_response=True),
        ]

        client = api_dms.DMSGraphQLClient()
        results = list(client.get_applications_with_details(123, dms_models.GraphQLApplicationStates.accepted))
        assert client.execute_query.call_count == 2
        assert len(results) == 2
        assert results[0].messages == [
            dms_models.DMSMessage(
                created_at=datetime.datetime(2021, 9, 14, 14, 2, 33), email="contact@demarches-simplifiees.fr"
            )
        ]
        assert results[0].state == dms_models.GraphQLApplicationStates.accepted

    @patch.object(api_dms.DMSGraphQLClient, "execute_query")
    def test_archive_application(self, execute_query):
        technical_id = "RandomApplicationId"

        execute_query.return_value = {"dossierArchiver": {"dossier": {"id": technical_id}, "errors": None}}
        client = api_dms.DMSGraphQLClient()
        client.archive_application("ApplicationTechnicalId", "InstructorTechId")

        assert client.execute_query.call_count == 1

    @patch.object(api_dms.DMSGraphQLClient, "execute_query")
    def test_get_single_application_details(self, execute_query):
        execute_query.return_value = make_single_application(12, state="accepte")

        client = api_dms.DMSGraphQLClient()
        result = client.get_single_application_details(42)

        assert client.execute_query.call_count == 1
        assert result.messages == [
            dms_models.DMSMessage(
                created_at=datetime.datetime(2021, 9, 14, 14, 2, 33), email="contact@demarches-simplifiees.fr"
            )
        ]
        assert result.state == dms_models.GraphQLApplicationStates.accepted

    @patch.object(api_dms.DMSGraphQLClient, "execute_query")
    def test_update_annotations(self, execute_query):
        execute_query.return_value = {
            "dossierModifierAnnotationText": {"annotation": {"id": "XXXXXXXXX"}, "errors": None}
        }
        client = api_dms.DMSGraphQLClient()
        client.update_text_annotation(
            "dossier_id", "instructeur_id", "error_annotation_id", "Il y a une grosse erreur ici"
        )

        assert client.execute_query.call_count == 1

    @time_machine.travel("2020-01-01")
    @patch.object(api_dms.DMSGraphQLClient, "execute_query")
    def test_get_deleted_applications(self, execute_query):
        procedure_number = 1
        execute_query.return_value = make_graphql_deleted_applications(procedure_number, application_numbers=[1, 2, 3])

        client = api_dms.DMSGraphQLClient()

        deleted_application_count = 0
        for result in client.get_deleted_applications(procedure_number):
            assert result.deletion_datetime == datetime.datetime(2021, 10, 1, 22, 0, 0)
            assert result.reason == "user_request"
            deleted_application_count += 1

        assert client.execute_query.call_count == 1
        assert deleted_application_count == 3
