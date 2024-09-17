# HIGH LEVEL INFORMATION
PUBLIC_API_DESCRIPTION = """
This the documentation of the Pass Culture public REST API.

# Important notice
- Since January 2023, rate limiting has been implemented on the Pass Culture API.
  You are limited to **200 requests/minute** per API key.
  Once this limit reached, you will received a `429 Too Many Requests` error message. You will then need to back down.
- Event offers dates are stored in the **UTC format**. This is necessary because dates are displayed according to the beneficiary timezone in our application. Eg., if an event is set to the 1st of september 2024 at 10AM in Paris, the date should be 2024-09-01T08:00:00Z, and if should happen at the same time but in Fort-de-France, the date should then be 2024-09-01T14:00:00Z. Please note that local timezones are accepted, for now, but UTC will soon be the only valid date format allowed.
- Any non-blank field sent using a `PATCH` method will be considered as changed, even if the new value is equal to old value.
  _For example, if you update the stock of an event, you **should not resend the `beginningDate`** if it has not changed because, otherwise it is going to trigger the reschedule process on our side._

# Authentication
The authentication system on the Pass Culture API uses an API key. For each of your requests, you should put your API key in the authorization header of the request following the `Bearer`pattern.
That is to say, in your request headers, you should have a line that looks like this : `Authorization: Bearer {you_api_key}` (**⚠️ Make sure to use the right API key for the right environment**)
An API key authenticates you as a provider. As a provider, you have access to the venues linked to your provider account by the offerers.
For in depth explanations about our authentication & authorization system, you [can read this documentation](/docs/understanding-our-api/authentication-authorization).
"""


# FIELDS DESCRIPTIONS
OFFER_STATUS_FIELD_DESCRIPTION = """
**Offer status:**

- `ACTIVE`: offer is validated and active. \n\n
- `DRAFT`: offer is still a draft and not yet submitted for validation. This status is not applicable to offers created via this API.\n\n
- `EXPIRED`: offer is validated but the booking limit datetime has passed.\n\n
- `INACTIVE`: offer is not active and cannot be booked.\n\n
- `PENDING`: offer is pending for pass Culture rules compliance validation. This step may take up to 72 hours.\n\n
- `REJECTED`: offer validation has been rejected because it is not compliant with pass Culture rules.\n\n
- `SOLD_OUT`: offer is validated but there is no (more) stock available for booking.
In the case of a collective offer, there is stock for only one booking ; if the booking is canceled, it is possible to book the collective offer again.
"""

COLLECTIVE_OFFER_STATUS_FIELD_DESCRIPTION = (
    OFFER_STATUS_FIELD_DESCRIPTION + "\n\n" + "- `ARCHIVED`: offer is archived by pro."
)

BOOKING_STATUS_DESCRIPTION = """
Booking status explanation:

* `CONFIRMED`: The beneficiary has booked an offer but he didn’t pick it up yet
* `USED`: The booking has been validated by the venue and will be reimbursed in the next payment
* `CANCELLED`: The booking has been cancelled by the beneficiary or by the provider
* `REIMBURSED` The booking has been reimbursed by pass Culture to the venue
"""

BEGINNING_DATETIME_FIELD_DESCRIPTION = "Beginning datetime of the event. The expected format is **[ISO 8601](https://fr.wikipedia.org/wiki/ISO_8601)** (standard format for timezone aware datetime)."
BOOKING_LIMIT_DATETIME_FIELD_DESCRIPTION = "Datetime after which the offer can no longer be booked. The expected format is **[ISO 8601](https://fr.wikipedia.org/wiki/ISO_8601)** (standard format for timezone aware datetime)."
