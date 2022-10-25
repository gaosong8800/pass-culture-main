from pcapi.core.educational import models
from pcapi.routes.adage.v1.serialization.config import AdageBaseResponseModel


class EducationalDepositResponse(AdageBaseResponseModel):
    uai: str
    deposit: float
    isFinal: bool


class EducationalDepositsResponse(AdageBaseResponseModel):
    deposits: list[EducationalDepositResponse]

    class Config:
        title = "List of deposit"


def serialize_educational_deposits(
    educational_deposits: list[models.EducationalDeposit],
) -> list[EducationalDepositResponse]:
    serialized_educational_deposit = []
    for educational_deposit in educational_deposits:
        serialized_educational_deposit.append(serialize_educational_deposit(educational_deposit))
    return serialized_educational_deposit


def serialize_educational_deposit(educational_deposit: models.EducationalDeposit) -> EducationalDepositResponse:
    return EducationalDepositResponse(
        deposit=educational_deposit.amount,
        uai=educational_deposit.uai,
        isFinal=educational_deposit.isFinal,
    )
