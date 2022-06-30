import {
  EducationalOfferModelPayload,
  IOfferEducationalFormValues,
  parseDuration,
  serializeParticipants,
} from 'core/OfferEducational'

import { PostCollectiveOfferBodyModel } from 'apiClient/v1'

const disabilityCompliances = (
  accessibility: IOfferEducationalFormValues['accessibility']
): Pick<
  EducationalOfferModelPayload,
  | 'audioDisabilityCompliant'
  | 'mentalDisabilityCompliant'
  | 'motorDisabilityCompliant'
  | 'visualDisabilityCompliant'
> => ({
  audioDisabilityCompliant: accessibility.audio,
  mentalDisabilityCompliant: accessibility.mental,
  motorDisabilityCompliant: accessibility.motor,
  visualDisabilityCompliant: accessibility.visual,
})

export const createOfferPayload = (
  offer: IOfferEducationalFormValues
): EducationalOfferModelPayload => ({
  offererId: offer.offererId,
  venueId: offer.venueId,
  subcategoryId: offer.subCategory,
  name: offer.title,
  bookingEmail: offer.notifications ? offer.notificationEmail : undefined,
  description: offer.description,
  durationMinutes: parseDuration(offer.duration),
  ...disabilityCompliances(offer.accessibility),
  extraData: {
    students: serializeParticipants(offer.participants),
    offerVenue: offer.eventAddress,
    contactEmail: offer.email,
    contactPhone: offer.phone,
  },
})

export const createCollectiveOfferPayload = (
  offer: IOfferEducationalFormValues,
  enableEducationalDomains: boolean
): PostCollectiveOfferBodyModel => ({
  offererId: offer.offererId,
  venueId: offer.venueId,
  subcategoryId: offer.subCategory,
  name: offer.title,
  bookingEmail: offer.notifications ? offer.notificationEmail : undefined,
  description: offer.description,
  durationMinutes: parseDuration(offer.duration),
  ...disabilityCompliances(offer.accessibility),
  students: serializeParticipants(offer.participants),
  offerVenue: offer.eventAddress,
  contactEmail: offer.email,
  contactPhone: offer.phone,
  domains: enableEducationalDomains
    ? offer.domains.map(domainIdString => Number(domainIdString))
    : undefined,
})
