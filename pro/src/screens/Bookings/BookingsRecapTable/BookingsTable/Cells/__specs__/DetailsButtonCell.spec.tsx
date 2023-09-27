import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'

import { CollectiveBookingsEvents } from 'core/FirebaseEvents/constants'
import * as useAnalytics from 'hooks/useAnalytics'
import { renderWithProviders } from 'utils/renderWithProviders'

import { DetailsButtonCell, DetailsButtonCellProps } from '../DetailsButtonCell'

const renderDetailsButtonCell = (props: DetailsButtonCellProps) => {
  renderWithProviders(<DetailsButtonCell {...props} />)
}

describe('DetailsButtonCell', () => {
  it('should log event when clicking on the button', async () => {
    const mockLogEvent = vi.fn()
    vi.spyOn(useAnalytics, 'default').mockImplementation(() => ({
      ...vi.importActual('hooks/useAnalytics'),
      logEvent: mockLogEvent,
    }))

    renderDetailsButtonCell({ isExpanded: false })

    const detailsButton = screen.getByRole('button', { name: 'Détails' })
    await userEvent.click(detailsButton)

    expect(mockLogEvent).toHaveBeenCalledTimes(1)
    expect(mockLogEvent).toHaveBeenNthCalledWith(
      1,
      CollectiveBookingsEvents.CLICKED_DETAILS_BUTTON_CELL,
      {
        from: '/',
      }
    )
  })
})
