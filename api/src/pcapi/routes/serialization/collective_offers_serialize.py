from datetime import date
from datetime import datetime
import enum
import typing

import flask
from pydantic.v1 import AnyHttpUrl
from pydantic.v1 import ConstrainedStr
from pydantic.v1 import EmailStr
from pydantic.v1 import Field
from pydantic.v1 import root_validator
from pydantic.v1 import validator

from pcapi.core.categories import subcategories_v2 as subcategories
from pcapi.core.educational import models as educational_models
from pcapi.core.offerers import models as offerers_models
from pcapi.core.offers import validation as offers_validation
from pcapi.models.offer_mixin import CollectiveOfferStatus
from pcapi.routes.native.v1.serialization.common_models import AccessibilityComplianceMixin
from pcapi.routes.serialization import BaseModel
from pcapi.routes.serialization import base as base_serializers
from pcapi.routes.serialization.educational_institutions import EducationalInstitutionResponseModel
from pcapi.routes.serialization.national_programs import NationalProgramModel
from pcapi.routes.shared.collective.serialization import offers as shared_offers
from pcapi.serialization import utils
from pcapi.serialization.utils import to_camel
from pcapi.utils.date import format_into_utc_date
from pcapi.utils.image_conversion import CropParams
from pcapi.validation.routes.offers import check_collective_offer_name_length_is_valid


def validate_venue_id(venue_id: int | str | None) -> int | None:
    # TODO(jeremieb): remove this validator once there is no empty
    # string stored as a venueId
    if not venue_id:
        return None
    return int(venue_id)  # should not be needed but it makes mypy happy


def strip_string(s: str | None) -> str | None:
    if not s:
        return s
    return s.strip()


def empty_to_null(s: str | None) -> str | None:
    if not s:
        return None
    return s


class EmptyAsNullString(str):
    @classmethod
    def __get_validators__(cls) -> typing.Generator[typing.Callable, None, None]:
        yield strip_string
        yield empty_to_null


EmptyStringToNone = EmptyAsNullString | None


class CollectiveOfferType(enum.Enum):
    offer = "offer"
    template = "template"


class ListCollectiveOffersQueryModel(BaseModel):
    nameOrIsbn: str | None
    offerer_id: int | None
    # TODO: (raphaelpra, 2024-07-08): Remove the type CollectiveOfferDisplayedStatus when front only use list in request
    status: (
        list[educational_models.CollectiveOfferDisplayedStatus]
        | educational_models.CollectiveOfferDisplayedStatus
        | None
    )
    venue_id: int | None
    categoryId: str | None
    creation_mode: str | None
    period_beginning_date: date | None
    period_ending_date: date | None
    collective_offer_type: CollectiveOfferType | None
    format: subcategories.EacFormat | None

    class Config:
        alias_generator = to_camel
        extra = "forbid"
        arbitrary_types_allowed = True

    @root_validator(pre=True)
    def format_status(cls, values: dict) -> dict:
        status = values.get("status")

        if not isinstance(status, list) and status is not None:
            values["status"] = [status]

        return values


class CollectiveOffersStockResponseModel(BaseModel):
    hasBookingLimitDatetimePassed: bool
    remainingQuantity: int | str
    beginningDatetime: datetime | None
    bookingLimitDatetime: datetime | None
    startDatetime: datetime | None
    endDatetime: datetime | None

    @validator("remainingQuantity", pre=True)
    def validate_remaining_quantity(cls, remainingQuantity: int | str) -> int | str:
        if remainingQuantity and remainingQuantity != "0" and not isinstance(remainingQuantity, int):
            return remainingQuantity.lstrip("0")
        return remainingQuantity


class EducationalRedactorResponseModel(BaseModel):
    email: str | None
    firstName: str | None
    lastName: str | None
    civility: str | None

    class Config:
        orm_mode = True


class TemplateDatesModel(BaseModel):
    start: datetime
    end: datetime

    class Config:
        json_encoders = {datetime: format_into_utc_date}


class CollectiveOffersBookingResponseModel(BaseModel):
    id: int
    booking_status: str


class CollectiveOfferResponseModel(BaseModel):
    hasBookingLimitDatetimesPassed: bool
    id: int
    isActive: bool
    isEditable: bool
    isEditableByPcPro: bool
    isEducational: bool
    name: str
    stocks: list[CollectiveOffersStockResponseModel]
    booking: CollectiveOffersBookingResponseModel | None
    subcategoryId: subcategories.SubcategoryIdEnum | EmptyStringToNone
    isShowcase: bool
    venue: base_serializers.ListOffersVenueResponseModel
    status: CollectiveOfferStatus
    displayedStatus: educational_models.CollectiveOfferDisplayedStatus
    allowedActions: (
        list[educational_models.CollectiveOfferAllowedAction]
        | list[educational_models.CollectiveOfferTemplateAllowedAction]
    )
    educationalInstitution: EducationalInstitutionResponseModel | None
    interventionArea: list[str]
    templateId: str | None
    imageCredit: str | None
    imageUrl: str | None
    isPublicApi: bool
    nationalProgram: NationalProgramModel | None
    formats: typing.Sequence[subcategories.EacFormat] | None
    dates: TemplateDatesModel | None

    class Config:
        alias_generator = to_camel


class ListCollectiveOffersResponseModel(BaseModel):
    __root__: list[CollectiveOfferResponseModel]

    class Config:
        json_encoders = {datetime: format_into_utc_date}


def serialize_collective_offers_capped(
    paginated_offers: list[educational_models.CollectiveOffer | educational_models.CollectiveOfferTemplate],
) -> list[CollectiveOfferResponseModel]:
    return [_serialize_offer_paginated(offer) for offer in paginated_offers]


def _serialize_offer_paginated(
    offer: educational_models.CollectiveOffer | educational_models.CollectiveOfferTemplate,
) -> CollectiveOfferResponseModel:
    serialized_stock = _serialize_stock(getattr(offer, "collectiveStock", None))
    last_booking = (
        _get_serialize_last_booking(offer.collectiveStock.collectiveBookings)
        if isinstance(offer, educational_models.CollectiveOffer) and offer.collectiveStock
        else None
    )
    serialized_stocks = [serialized_stock] if serialized_stock is not None else []
    is_offer_template = isinstance(offer, educational_models.CollectiveOfferTemplate)
    institution = getattr(offer, "institution", None)
    templateId = getattr(offer, "templateId", None)

    return CollectiveOfferResponseModel(  # type: ignore[call-arg]
        hasBookingLimitDatetimesPassed=offer.hasBookingLimitDatetimesPassed if not is_offer_template else False,
        id=offer.id,
        isActive=False if offer.status == CollectiveOfferStatus.INACTIVE else offer.isActive,
        isEditable=offer.isEditable,
        isEditableByPcPro=offer.isEditableByPcPro,
        isEducational=True,
        name=offer.name,
        stocks=serialized_stocks,  # type: ignore[arg-type]
        booking=last_booking,
        thumbUrl=None,
        subcategoryId=offer.subcategoryId,  # type: ignore[arg-type]
        venue=_serialize_venue(offer.venue),  # type: ignore[arg-type]
        status=offer.status.name,
        displayedStatus=offer.displayedStatus,
        allowedActions=offer.allowedActions,
        isShowcase=is_offer_template,
        educationalInstitution=EducationalInstitutionResponseModel.from_orm(institution) if institution else None,
        interventionArea=offer.interventionArea,
        templateId=templateId,
        imageCredit=offer.imageCredit,
        imageUrl=offer.imageUrl,
        isPublicApi=offer.isPublicApi if not is_offer_template else False,
        nationalProgram=offer.nationalProgram,
        formats=offer.get_formats(),
        dates=offer.dates,  # type: ignore[arg-type]
    )


def _serialize_stock(stock: educational_models.CollectiveStock | None = None) -> dict:
    if stock:
        return {
            "id": stock.id,
            "hasBookingLimitDatetimePassed": stock.hasBookingLimitDatetimePassed,
            "remainingQuantity": 0 if stock.isSoldOut else 1,
            "beginningDatetime": stock.beginningDatetime,
            "startDatetime": stock.startDatetime,
            "endDatetime": stock.endDatetime,
            "bookingLimitDatetime": stock.bookingLimitDatetime,
        }
    return {
        "hasBookingLimitDatetimePassed": False,
        "remainingQuantity": 1,
        "beginningDatetime": None,
        "startDatetime": None,
        "endDatetime": None,
        "bookingLimitDatetime": None,
    }


def _serialize_venue(venue: offerers_models.Venue) -> dict:
    return {
        "id": venue.id,
        "isVirtual": venue.isVirtual,
        "name": venue.name,
        "offererName": venue.managingOfferer.name,
        "publicName": venue.publicName,
        "departementCode": venue.departementCode,
    }


def _get_serialize_last_booking(
    bookings: list[educational_models.CollectiveBooking],
) -> CollectiveOffersBookingResponseModel | None:
    if len(bookings) == 0:
        return None
    last_booking = sorted(bookings, key=lambda b: b.dateCreated, reverse=True)[0]
    return CollectiveOffersBookingResponseModel(
        id=last_booking.id,
        booking_status=last_booking.status.value,
    )


class OfferDomain(BaseModel):
    id: int
    name: str

    class Config:
        alias_generator = to_camel
        orm_mode = True


class GetCollectiveOfferManagingOffererResponseModel(BaseModel):
    id: int
    name: str
    # FIXME (dbaty, 2020-11-09): optional until we populate the database (PC-5693)
    siren: str | None
    allowedOnAdage: bool

    class Config:
        orm_mode = True


class GetCollectiveOfferVenueResponseModel(BaseModel):
    departementCode: str | None
    id: int
    managingOfferer: GetCollectiveOfferManagingOffererResponseModel
    name: str
    publicName: str | None
    bannerUrl: str | None = Field(alias="imgUrl")

    class Config:
        orm_mode = True
        json_encoders = {datetime: format_into_utc_date}
        allow_population_by_field_name = True


class OfferAddressType(enum.Enum):
    OFFERER_VENUE = "offererVenue"
    SCHOOL = "school"
    OTHER = "other"


class CollectiveOfferOfferVenueResponseModel(BaseModel):
    addressType: OfferAddressType
    otherAddress: str
    venueId: int | None

    _validated_venue_id = validator("venueId", pre=True, allow_reuse=True)(validate_venue_id)


class PriceDetail(ConstrainedStr):
    max_length: int = 1_000


class GetCollectiveOfferCollectiveStockResponseModel(BaseModel):
    id: int
    isSoldOut: bool = Field(alias="isBooked")
    is_cancellable_from_offerer: bool = Field(alias="isCancellable")
    # beginningDatetime is deprecated and replaced with
    # startDatetime and endDatetime
    beginningDatetime: datetime | None
    startDatetime: datetime | None
    endDatetime: datetime | None
    bookingLimitDatetime: datetime | None
    price: float
    numberOfTickets: int | None
    priceDetail: PriceDetail | None = Field(alias="educationalPriceDetail")
    isEditable: bool = Field(alias="isEducationalStockEditable")

    class Config:
        allow_population_by_field_name = True
        orm_mode = True
        json_encoders = {datetime: format_into_utc_date}


class GetCollectiveOfferBaseResponseModel(BaseModel, AccessibilityComplianceMixin):
    bookingEmails: list[str]
    dateCreated: datetime
    description: str
    durationMinutes: int | None
    students: list[educational_models.StudentLevels]
    offerVenue: CollectiveOfferOfferVenueResponseModel
    contactEmail: str | None
    contactPhone: str | None
    hasBookingLimitDatetimesPassed: bool
    offerId: int | None
    isActive: bool
    isEditable: bool
    id: int
    name: str
    subcategoryId: subcategories.SubcategoryIdEnum | EmptyStringToNone
    venue: GetCollectiveOfferVenueResponseModel
    status: CollectiveOfferStatus
    displayedStatus: educational_models.CollectiveOfferDisplayedStatus
    domains: list[OfferDomain]
    interventionArea: list[str]
    is_cancellable_from_offerer: bool = Field(alias="isCancellable")
    imageCredit: str | None
    imageUrl: str | None
    nationalProgram: NationalProgramModel | None
    formats: typing.Sequence[subcategories.EacFormat] | None
    isNonFreeOffer: bool | None

    class Config:
        allow_population_by_field_name = True
        orm_mode = True
        json_encoders = {datetime: format_into_utc_date}
        use_enum_values = True


class GetCollectiveOfferTemplateResponseModel(GetCollectiveOfferBaseResponseModel):
    priceDetail: PriceDetail | None = Field(alias="educationalPriceDetail")
    dates: TemplateDatesModel | None
    isTemplate: bool = True
    contactEmail: str | None
    contactPhone: str | None
    contactUrl: str | None
    contactForm: educational_models.OfferContactFormEnum | None
    allowedActions: list[educational_models.CollectiveOfferTemplateAllowedAction]

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class CollectiveOfferRedactorModel(BaseModel):
    firstName: str | None
    lastName: str | None
    email: str


class CollectiveOfferInstitutionModel(BaseModel):
    institutionId: str
    institutionType: str
    name: str
    city: str
    postalCode: str


class GetCollectiveOfferRequestResponseModel(BaseModel):
    redactor: CollectiveOfferRedactorModel
    requestedDate: date | None
    totalStudents: int | None
    totalTeachers: int | None
    phoneNumber: str | None
    comment: str
    dateCreated: date | None
    institution: CollectiveOfferInstitutionModel

    class Config:
        allow_population_by_field_name = True


class GetCollectiveOfferProviderResponseModel(BaseModel):
    name: str

    class Config:
        orm_mode = True


class GetCollectiveOfferResponseModel(GetCollectiveOfferBaseResponseModel):
    isBookable: bool
    collectiveStock: GetCollectiveOfferCollectiveStockResponseModel | None
    institution: EducationalInstitutionResponseModel | None
    isVisibilityEditable: bool
    templateId: int | None
    lastBookingStatus: educational_models.CollectiveBookingStatus | None
    lastBookingId: int | None
    teacher: EducationalRedactorResponseModel | None
    isPublicApi: bool
    provider: GetCollectiveOfferProviderResponseModel | None
    formats: typing.Sequence[subcategories.EacFormat] | None
    isTemplate: bool = False
    dates: TemplateDatesModel | None
    allowedActions: list[educational_models.CollectiveOfferAllowedAction]

    @classmethod
    def from_orm(cls, offer: educational_models.CollectiveOffer) -> "GetCollectiveOfferResponseModel":
        result = super().from_orm(offer)
        result.formats = offer.get_formats()

        if result.status == CollectiveOfferStatus.INACTIVE.name:
            result.isActive = False

        return result


class CollectiveOfferResponseIdModel(BaseModel):
    id: int

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        arbitrary_types_allowed = True


class CollectiveOfferVenueBodyModel(BaseModel):
    addressType: OfferAddressType
    otherAddress: str
    venueId: int | None

    _validated_venue_id = validator("venueId", pre=True, allow_reuse=True)(validate_venue_id)

    class Config:
        alias_generator = to_camel
        extra = "forbid"


def is_intervention_area_valid(
    intervention_area: list[str] | None,
    offer_venue: CollectiveOfferVenueBodyModel | None,
) -> bool:
    if intervention_area is None:
        return False

    if offer_venue is not None and offer_venue.addressType == OfferAddressType.OFFERER_VENUE:
        return True

    if len(intervention_area) == 0:
        return False

    return True


class DateRangeModel(BaseModel):
    start: datetime
    end: datetime

    @validator("start")
    def validate_start(cls, start: datetime) -> datetime:
        return utils.without_timezone(start)

    @validator("end")
    def validate_end(cls, end: datetime) -> datetime:
        return utils.without_timezone(end)

    @root_validator(skip_on_failure=True)
    def validate_end_before_start(cls, values: dict) -> dict:
        if values["start"] > values["end"]:
            raise ValueError("end before start")

        return values


class DateRangeOnCreateModel(DateRangeModel):
    @validator("start")
    def validate_start(cls, start: datetime) -> datetime:
        start = super().validate_start(start)

        if start.date() < date.today():
            raise ValueError("start date can't be passed")
        return start


from typing import Union

from pydantic.v1.networks import validate_email


class EmailStrOrEmpty(EmailStr):
    @classmethod
    def validate(cls, value: Union[str]) -> str | None:  # type: ignore[override]
        if value == "":
            return None
        return validate_email(value)[1]


class PostCollectiveOfferBodyModel(BaseModel):
    venue_id: int
    # TODO(jeremieb): remove subcategory_id (replaced by formats)
    subcategory_id: str | None
    name: str
    booking_emails: list[EmailStr]
    description: str
    domains: list[int]
    duration_minutes: int | None
    audio_disability_compliant: bool = False
    mental_disability_compliant: bool = False
    motor_disability_compliant: bool = False
    visual_disability_compliant: bool = False
    students: list[educational_models.StudentLevels]
    offer_venue: CollectiveOfferVenueBodyModel
    contact_email: EmailStrOrEmpty | None
    contact_phone: str | None
    intervention_area: list[str] | None
    template_id: int | None
    offerer_id: (
        str | None
    )  # FIXME (MathildeDuboille - 24/10/22) prevent bug in production where offererId is sent in params
    nationalProgramId: int | None
    # TODO(jeremieb): when subcategory_id is removed, formats becomes
    # mandatory
    formats: typing.Sequence[subcategories.EacFormat] | None

    @validator("students")
    def validate_students(cls, students: list[str]) -> list[educational_models.StudentLevels]:
        return shared_offers.validate_students(students)

    @root_validator
    def validate_formats_and_subcategory(cls, values: dict) -> dict:
        # TODO(jeremieb): remove this validator when subcategory_id can
        # be removed
        if values.get("template_id"):
            return values

        formats = values.get("formats")
        if formats:
            return values

        subcategory_id = values.get("subcategory_id")
        if not subcategory_id:
            raise ValueError("subcategory_id & formats: at least one should not be null")

        try:
            subcategory = subcategories.COLLECTIVE_SUBCATEGORIES[subcategory_id]
        except KeyError:
            raise ValueError("Unknown subcategory id")

        values["formats"] = subcategory.formats
        return values

    @validator("name", pre=True)
    def validate_name(cls, name: str) -> str:
        check_collective_offer_name_length_is_valid(name)
        return name

    @validator("domains")
    def validate_domains(cls, domains: list[str]) -> list[str]:
        if not domains:
            raise ValueError("domains must have at least one value")
        return domains

    @validator("intervention_area")
    def validate_intervention_area(
        cls,
        intervention_area: list[str] | None,
        values: dict,
    ) -> list[str] | None:
        offer_venue = values.get("offer_venue", None)
        if not is_intervention_area_valid(intervention_area, offer_venue):
            raise ValueError("intervention_area must have at least one value")
        return intervention_area

    @validator("booking_emails")
    def validate_booking_emails(cls, booking_emails: list[str]) -> list[str]:
        if not booking_emails:
            raise ValueError("Un email doit etre renseigné.")
        return booking_emails

    class Config:
        alias_generator = to_camel
        extra = "forbid"


class PostCollectiveOfferTemplateBodyModel(PostCollectiveOfferBodyModel):
    price_detail: PriceDetail | None
    contact_email: EmailStr | None  # type: ignore[assignment]
    contact_url: AnyHttpUrl | None
    contact_form: educational_models.OfferContactFormEnum | None

    # TODO(jeremieb) | None is temporary
    # when the frontend clients are up to date, dateRange should
    # become mandatory
    dates: DateRangeOnCreateModel | None

    class Config:
        alias_generator = to_camel
        extra = "forbid"


class CollectiveOfferTemplateBodyModel(BaseModel):
    price_detail: PriceDetail | None = Field(alias="educationalPriceDetail")

    class Config:
        alias_generator = to_camel
        extra = "forbid"


class CollectiveOfferTemplateResponseIdModel(BaseModel):
    id: int

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        arbitrary_types_allowed = True


class PatchCollectiveOfferBodyModel(BaseModel, AccessibilityComplianceMixin):
    bookingEmails: list[EmailStr] | None
    description: str | None
    name: str | None
    students: list[educational_models.StudentLevels] | None
    offerVenue: CollectiveOfferVenueBodyModel | None
    contactEmail: EmailStr | None
    contactPhone: str | None
    durationMinutes: int | None
    subcategoryId: subcategories.SubcategoryIdEnum | EmptyStringToNone
    domains: list[int] | None
    interventionArea: list[str] | None
    venueId: int | None
    nationalProgramId: int | None
    formats: typing.Sequence[subcategories.EacFormat] | None

    @validator("students")
    def validate_students(cls, students: list[str] | None) -> list[educational_models.StudentLevels] | None:
        if not students:
            return None
        return shared_offers.validate_students(students)

    @validator("name", allow_reuse=True)
    def validate_name(cls, name: str | None) -> str | None:
        assert name is not None and name.strip() != ""
        check_collective_offer_name_length_is_valid(name)
        return name

    @validator("description", allow_reuse=True)
    def validate_description(cls, description: str | None) -> str | None:
        if description is None:
            raise ValueError("Description cannot be NULL.")
        return description

    @validator("domains")
    def validate_domains_collective_offer_edition(
        cls,
        domains: list[int] | None,
    ) -> list[int] | None:
        if domains is None or (domains is not None and len(domains) == 0):
            raise ValueError("domains must have at least one value")

        return domains

    @validator("interventionArea")
    def validate_intervention_area_not_empty_when_specified(
        cls,
        intervention_area: list[str] | None,
        values: dict,
    ) -> list[str] | None:
        if not is_intervention_area_valid(intervention_area, values.get("offerVenue", None)):
            raise ValueError("interventionArea must have at least one value")

        return intervention_area

    @validator("bookingEmails")
    def validate_booking_emails(cls, booking_emails: list[str]) -> list[str]:
        if not booking_emails:
            raise ValueError("Un email doit être renseigné.")
        return booking_emails

    @validator("venueId", allow_reuse=True)
    def validate_venue_id(cls, venue_id: int | None) -> int | None:
        if venue_id is None:
            raise ValueError("venue_id cannot be NULL.")
        return venue_id

    class Config:
        alias_generator = to_camel
        extra = "forbid"


class PatchCollectiveOfferTemplateBodyModel(PatchCollectiveOfferBodyModel):
    priceDetail: PriceDetail | None
    domains: list[int] | None
    dates: DateRangeModel | None
    contactUrl: str | None
    contactForm: educational_models.OfferContactFormEnum | None

    @validator("domains")
    def validate_domains_collective_offer_template_edition(
        cls,
        domains: list[int] | None,
    ) -> list[int] | None:
        if domains is not None and len(domains) == 0:
            raise ValueError("domains must have at least one value")

        return domains

    @root_validator
    def validate_contact_fields(cls, values: dict) -> dict:
        url = values.get("contactUrl")
        form = values.get("contactForm")

        if url and form:
            raise ValueError("error: url and form are both not null")

        return values

    class Config:
        alias_generator = to_camel
        extra = "forbid"


class PatchCollectiveOfferActiveStatusBodyModel(BaseModel):
    is_active: bool
    ids: list[int]

    class Config:
        alias_generator = to_camel


class PatchCollectiveOfferArchiveBodyModel(BaseModel):
    ids: list[int]


class PatchCollectiveOfferEducationalInstitution(BaseModel):
    educational_institution_id: int | None
    teacher_email: str | None

    class Config:
        alias_generator = to_camel
        extra = "allow"


class AttachImageFormModel(BaseModel):
    credit: str
    cropping_rect_x: float
    cropping_rect_y: float
    cropping_rect_height: float
    cropping_rect_width: float

    class Config:
        alias_generator = to_camel

    @property
    def crop_params(self) -> CropParams:
        return CropParams.build(
            x_crop_percent=self.cropping_rect_x,
            y_crop_percent=self.cropping_rect_y,
            height_crop_percent=self.cropping_rect_height,
            width_crop_percent=self.cropping_rect_width,
        )

    def get_image_as_bytes(self, request: flask.Request) -> bytes:
        """
        Get the image from the POSTed data (request)
        Only the max size is checked at this stage, and possibly the content type header
        """
        if "thumb" in request.files:
            blob = request.files["thumb"]
            image_as_bytes = blob.read()
            offers_validation.check_image_size(image_as_bytes)
            return image_as_bytes

        raise offers_validation.exceptions.MissingImage()


class AttachImageResponseModel(BaseModel):
    imageUrl: str

    class Config:
        orm_mode = True
