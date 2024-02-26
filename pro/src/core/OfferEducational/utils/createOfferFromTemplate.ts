import { useNavigate } from 'react-router-dom'

import useNotification from 'hooks/useNotification'

import getCollectiveOfferFormDataApdater from '../adapters/getCollectiveOfferFormDataAdapter'
import getCollectiveOfferTemplateAdapter from '../adapters/getCollectiveOfferTemplateAdapter'
import postCollectiveOfferAdapter from '../adapters/postCollectiveOfferAdapter'

import { computeInitialValuesFromOffer } from './computeInitialValuesFromOffer'
import { postCollectiveOfferImage } from './postCollectiveOfferImage'

export const createOfferFromTemplate = async (
  navigate: ReturnType<typeof useNavigate>,
  notify: ReturnType<typeof useNotification>,
  templateOfferId: number,
  requestId?: string,
  isMarseilleActive?: boolean
) => {
  const offerTemplateResponse =
    await getCollectiveOfferTemplateAdapter(templateOfferId)

  if (!offerTemplateResponse.isOk) {
    return notify.error(offerTemplateResponse.message)
  }
  const offererId = offerTemplateResponse.payload.venue.managingOfferer.id
  const result = await getCollectiveOfferFormDataApdater({
    offererId: offererId,
    offer: offerTemplateResponse.payload,
  })

  if (!result.isOk) {
    return notify.error(result.message)
  }

  const { offerers } = result.payload

  const initialValues = computeInitialValuesFromOffer(
    offerers,
    false,
    offerTemplateResponse.payload,
    undefined,
    undefined,
    isMarseilleActive
  )

  const { isOk, message, payload } = await postCollectiveOfferAdapter({
    offer: initialValues,
    offerTemplateId: templateOfferId,
  })

  if (!isOk) {
    return notify.error(message)
  }

  await postCollectiveOfferImage({ initialValues, notify, payload })

  navigate(
    `/offre/collectif/${payload.id}/creation?structure=${offererId}${
      requestId ? `&requete=${requestId}` : ''
    }`
  )
}
