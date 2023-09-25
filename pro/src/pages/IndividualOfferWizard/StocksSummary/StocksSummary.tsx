/* istanbul ignore file: DEBT, TO FIX */
import React from 'react'

import IndivualOfferLayout from 'screens/IndividualOffer/IndivualOfferLayout/IndivualOfferLayout'
import { StocksSummary as StocksSummaryScreen } from 'screens/IndividualOffer/StocksSummary/StocksSummary'

export const StocksSummary = (): JSX.Element | null => {
  return (
    <IndivualOfferLayout title="Récapitulatif">
      <StocksSummaryScreen />
    </IndivualOfferLayout>
  )
}
