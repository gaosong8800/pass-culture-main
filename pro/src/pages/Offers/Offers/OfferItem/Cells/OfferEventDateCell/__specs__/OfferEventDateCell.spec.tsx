import { screen } from '@testing-library/react'

import { collectiveOfferFactory } from 'utils/collectiveApiFactories'
import { renderWithProviders } from 'utils/renderWithProviders'

import {
  OfferEventDateCell,
  OfferEventDateCellProps,
} from '../OfferEventDateCell'

const renderOfferNameCell = (props: OfferEventDateCellProps) =>
  renderWithProviders(
    <table>
      <tbody>
        <tr>
          <OfferEventDateCell {...props} />
        </tr>
      </tbody>
    </table>,
    {
      initialRouterEntries: ['/offres'],
    }
  )

describe('OfferNameCell', () => {
  it('should display 1 date and time when dates are the same', () => {
    const eventOffer = collectiveOfferFactory({
      isShowcase: false,
      name: 'Offre nom',
      stocks: [
        {
          startDatetime: '2024-08-04T13:00:00Z',
          endDatetime: '2024-08-04T13:00:00Z',
          hasBookingLimitDatetimePassed: false,
          remainingQuantity: 1,
        },
      ],
    })

    renderOfferNameCell({
      offer: eventOffer,
    })

    expect(screen.getByText('04/08/2024')).toBeInTheDocument()
    expect(screen.getByText('à partir de 13h00')).toBeInTheDocument()
  })

  it('should display both date and time when dates are not the same', () => {
    const eventOffer = collectiveOfferFactory({
      isShowcase: false,
      name: 'Offre nom',
      stocks: [
        {
          startDatetime: '2024-08-04T13:00:00Z',
          endDatetime: '2024-09-04T13:00:00Z',
          hasBookingLimitDatetimePassed: false,
          remainingQuantity: 1,
        },
      ],
    })

    renderOfferNameCell({
      offer: eventOffer,
    })

    expect(screen.getByText('du 04/08/2024')).toBeInTheDocument()
    expect(screen.getByText('au 04/09/2024')).toBeInTheDocument()
    expect(screen.getByText('à partir de 13h00')).toBeInTheDocument()
  })

  it('must display "Toute l’année scolaire" if dates are not defined', () => {
    const eventOffer = collectiveOfferFactory({
      isShowcase: true,
      name: 'Offre nom',
      stocks: [
        {
          startDatetime: null,
          endDatetime: null,
          hasBookingLimitDatetimePassed: false,
          remainingQuantity: 1,
        },
      ],
    })

    renderOfferNameCell({
      offer: eventOffer,
    })

    expect(screen.getByText('Toute l’année scolaire')).toBeInTheDocument()
  })
})
