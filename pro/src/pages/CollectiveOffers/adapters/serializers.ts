import { CollectiveOfferResponseModel, OfferStatus } from 'apiClient/v1'
import { Offer, Stock } from 'core/Offers/types'

const serializeStocks = (
  stocks: CollectiveOfferResponseModel['stocks']
): Stock[] =>
  stocks.map((stock) => ({
    beginningDatetime: stock.beginningDatetime
      ? new Date(stock.beginningDatetime)
      : null,
    remainingQuantity: stock.remainingQuantity,
    bookingLimitDatetime: stock.bookingLimitDatetime
      ? new Date(stock.bookingLimitDatetime)
      : null,
  }))

export const serializeOffers = (
  offers: CollectiveOfferResponseModel[]
): Offer[] =>
  offers.map((offer) => ({
    id: offer.id,
    // FIX ME: api should send OfferStatus
    status: offer.status as OfferStatus,
    isActive: offer.isActive,
    hasBookingLimitDatetimesPassed: offer.hasBookingLimitDatetimesPassed,
    thumbUrl: offer.imageUrl,
    isEducational: true,
    name: offer.name,
    isEvent: true,
    productIsbn: null,
    venue: offer.venue,
    stocks: serializeStocks(offer.stocks),
    isPublicApi: offer.isPublicApi,
    isEditable: offer.isEditable,
    isShowcase: offer.isShowcase,
    educationalInstitution: offer.educationalInstitution,
    educationalBooking: offer.booking,
  }))
