from flask import current_app as app
from flask import jsonify
from flask_jwt_extended import create_access_token
from flask_jwt_extended import create_refresh_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_refresh_token_required
from flask_jwt_extended import jwt_required

from pcapi.core.users import api as users_api
from pcapi.core.users import exceptions as users_exceptions
from pcapi.core.users import repository as users_repo
from pcapi.core.users.models import TokenType
from pcapi.core.users.utils import format_email
from pcapi.domain.password import check_password_strength
from pcapi.domain.user_emails import send_reset_password_email_to_native_app_user
from pcapi.models.api_errors import ApiErrors
from pcapi.repository import repository
from pcapi.repository.user_queries import find_user_by_email
from pcapi.routes.native.v1.serialization.authentication import RequestPasswordResetRequest
from pcapi.routes.native.v1.serialization.authentication import ResetPasswordRequest
from pcapi.routes.native.v1.serialization.authentication import ValidateEmailRequest
from pcapi.routes.native.v1.serialization.authentication import ValidateEmailResponse
from pcapi.serialization.decorator import spectree_serialize
from pcapi.utils.mailing import send_raw_email

from . import blueprint
from .serialization import authentication


@blueprint.native_v1.route("/signin", methods=["POST"])
@spectree_serialize(
    response_model=authentication.SigninResponse,
    on_success_status=200,
    api=blueprint.api,
)  # type: ignore
def signin(body: authentication.SigninRequest) -> authentication.SigninResponse:
    try:
        users_repo.get_user_with_credentials(body.identifier, body.password)
    except users_exceptions.CredentialsException as exc:
        raise ApiErrors(
            {"general": ["Identifiant ou Mot de passe incorrect"]},
            status_code=400,
        ) from exc

    user_email = format_email(body.identifier)

    return authentication.SigninResponse(
        access_token=create_access_token(identity=user_email),
        refresh_token=create_refresh_token(identity=user_email),
    )


@blueprint.native_v1.route("/refresh_access_token", methods=["POST"])
@jwt_refresh_token_required
@spectree_serialize(response_model=authentication.RefreshResponse, api=blueprint.api)  # type: ignore
def refresh() -> authentication.RefreshResponse:
    current_user = get_jwt_identity()
    return authentication.RefreshResponse(access_token=create_access_token(identity=current_user))


@blueprint.native_v1.route("/request_password_reset", methods=["POST"])
@spectree_serialize(on_success_status=204, api=blueprint.api, on_error_statuses=[400])  # type: ignore
def request_password_reset(body: RequestPasswordResetRequest) -> None:
    user = find_user_by_email(body.email)

    if not user:
        return

    reset_password_token = users_api.create_reset_password_token(user)

    is_email_sent = send_reset_password_email_to_native_app_user(
        user.email, reset_password_token.value, reset_password_token.expirationDate, send_raw_email
    )

    if not is_email_sent:
        app.logger.error("Email service failure when user request password reset with %s", user.email)
        raise ApiErrors(
            {"email": ["L'email n'a pas pu être envoyé"]},
            status_code=400,
        )


@blueprint.native_v1.route("/protected", methods=["GET"])
@jwt_required
def protected() -> any:  # type: ignore
    # Access the identity of the current user with get_jwt_identity
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


@blueprint.native_v1.route("/reset_password", methods=["POST"])
@spectree_serialize(on_success_status=204, api=blueprint.api, on_error_statuses=[400])
def reset_password(body: ResetPasswordRequest) -> None:
    user = users_repo.get_user_with_valid_token(body.reset_password_token, [TokenType.RESET_PASSWORD])

    if not user:
        raise ApiErrors({"token": ["Le token de changement de mot de passe est invalide."]})

    check_password_strength("newPassword", body.new_password)

    user.setPassword(body.new_password)
    repository.save(user)


@blueprint.native_v1.route("/validate_email", methods=["POST"])
@spectree_serialize(on_success_status=200, api=blueprint.api, response_model=ValidateEmailResponse)
def validate_email(body: ValidateEmailRequest) -> ValidateEmailResponse:
    user = users_repo.get_user_with_valid_token(body.email_validation_token, [TokenType.EMAIL_VALIDATION])

    if not user:
        raise ApiErrors({"token": ["Le token de validation d'email est invalide."]})

    user.isEmailValidated = True
    repository.save(user)

    id_check_token = users_api.create_id_check_token(user)

    response = ValidateEmailResponse(
        access_token=create_access_token(identity=user.email),
        refresh_token=create_refresh_token(identity=user.email),
        id_check_token=id_check_token.value if id_check_token else None,
    )

    return response
