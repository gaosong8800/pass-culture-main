import React from 'react'

import {
  ListOffersOfferResponseModel,
  ListOffersVenueResponseModel,
} from 'apiClient/v1'
import { Audience } from 'core/shared/types'
import { useActiveFeature } from 'hooks/useActiveFeature'
import styles from 'pages/Offers/Offers/OfferItem/OfferItem.module.scss'
import { computeAddressDisplayName } from 'repository/venuesService'

import { CheckboxCell } from './Cells/CheckboxCell'
import { IndividualActionsCells } from './Cells/IndividualActionsCell'
import { OfferNameCell } from './Cells/OfferNameCell/OfferNameCell'
import { OfferRemainingStockCell } from './Cells/OfferRemainingStockCell'
import { OfferStatusCell } from './Cells/OfferStatusCell'
import { OfferVenueCell } from './Cells/OfferVenueCell'
import { ThumbCell } from './Cells/ThumbCell'

type IndividualOfferItemProps = {
  disabled: boolean
  isSelected: boolean
  offer: ListOffersOfferResponseModel
  selectOffer: (offer: ListOffersOfferResponseModel) => void
  editionOfferLink: string
  editionStockLink: string
  venue: ListOffersVenueResponseModel
  audience: Audience
}

export const IndividualOfferItem = ({
  disabled,
  offer,
  isSelected,
  selectOffer,
  editionOfferLink,
  editionStockLink,
  venue,
  audience,
}: IndividualOfferItemProps) => {
  const offerAddressEnabled = useActiveFeature('WIP_ENABLE_OFFER_ADDRESS')

  return (
    <>
      <CheckboxCell
        offerName={offer.name}
        status={offer.status}
        disabled={disabled}
        isSelected={isSelected}
        selectOffer={() => selectOffer(offer)}
      />

      <ThumbCell offer={offer} editionOfferLink={editionOfferLink} />

      <OfferNameCell
        offer={offer}
        editionOfferLink={editionOfferLink}
        audience={audience}
      />

      {offerAddressEnabled && offer.address ? (
        <td className={styles['venue-column']}>
          {computeAddressDisplayName(offer.address)}
        </td>
      ) : (
        <OfferVenueCell venue={venue} />
      )}

      <OfferRemainingStockCell stocks={offer.stocks} />

      <OfferStatusCell status={offer.status} />

      <IndividualActionsCells
        offer={offer}
        editionOfferLink={editionOfferLink}
        editionStockLink={editionStockLink}
      />
    </>
  )
}
