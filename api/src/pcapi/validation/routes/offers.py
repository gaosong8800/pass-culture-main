from typing import Any

from pcapi.models.api_errors import ApiErrors


def check_offer_name_length_is_valid(offer_name: str) -> None:
    max_offer_name_length = 90
    if len(offer_name) > max_offer_name_length:
        api_error = ApiErrors()
        api_error.add_error("name", "Le titre de l’offre doit faire au maximum 90 caractères.")
        raise api_error


def check_collective_offer_name_length_is_valid(offer_name: str) -> None:
    max_offer_name_length = 110
    if len(offer_name) > max_offer_name_length:
        api_error = ApiErrors()
        api_error.add_error("name", "Le titre de l’offre doit faire au maximum 110 caractères.")
        raise api_error


def check_offer_product_update(extra_data: dict[str, Any]) -> None:
    if extra_data.get("ean", False):
        api_error = ApiErrors()
        api_error.add_error("ean", "Vous ne pouvez pas changer cette information")
        raise api_error
