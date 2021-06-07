import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { getVenuesForOfferer } from 'repository/pcapi/pcapi'
import { venueFactory } from 'utils/apiFactories'

import PreFilters from '../PreFilters'

jest.mock('utils/date', () => ({
  ...jest.requireActual('utils/date'),
  getToday: jest.fn().mockImplementation(() => new Date('2020-12-15T12:00:00Z')),
}))

jest.mock('repository/pcapi/pcapi', () => ({
  getVenuesForOfferer: jest.fn(),
}))

describe('filter bookings by bookings period', () => {
  let props
  beforeEach(() => {
    props = {
      applyPreFilters: jest.fn(),
    }

    getVenuesForOfferer.mockResolvedValue([venueFactory()])
  })

  it('should select 30 days before today as period beginning date by default', async () => {
    // When
    render(<PreFilters {...props} />)

    // Then
    expect(await screen.findByDisplayValue('15/11/2020')).toBeInTheDocument()
  })

  it('should select today as period ending date by default', async () => {
    // When
    render(<PreFilters {...props} />)

    // Then
    expect(await screen.findByDisplayValue('15/12/2020')).toBeInTheDocument()
  })

  it('should allow to select period ending date before today', async () => {
    // Given
    render(<PreFilters {...props} />)
    const periodEndingDateInput = screen.getByDisplayValue('15/12/2020')

    // When
    fireEvent.click(periodEndingDateInput)
    fireEvent.click(screen.getByText('14'))

    // Then
    expect(await screen.findByDisplayValue('14/12/2020')).toBeInTheDocument()
  })

  it('should not allow to select period ending date after today', async () => {
    // Given
    render(<PreFilters {...props} />)

    // When
    const periodEndingDateInput = await screen.findByDisplayValue('15/12/2020')
    fireEvent.click(periodEndingDateInput)
    fireEvent.click(screen.getByText('16'))

    // Then
    expect(screen.queryByDisplayValue('16/12/2020')).not.toBeInTheDocument()
  })

  it('should not allow to select period ending date before selected beginning date', async () => {
    // Given
    render(<PreFilters {...props} />)
    const periodEndingDateInput = screen.getByDisplayValue('15/12/2020')

    // When
    fireEvent.click(periodEndingDateInput)
    fireEvent.click(screen.getByLabelText('Previous Month'))
    fireEvent.click(screen.getByText('13'))

    // Then
    expect(screen.queryByDisplayValue('13/12/2020')).not.toBeInTheDocument()
  })

  it('should allow to select period beginning date before selected ending date', async () => {
    // Given
    render(<PreFilters {...props} />)
    const periodBeginningDateInput = screen.getByDisplayValue('15/11/2020')

    // When
    fireEvent.click(periodBeginningDateInput)
    fireEvent.click(screen.getByText('14'))

    // Then
    expect(await screen.findByDisplayValue('14/11/2020')).toBeInTheDocument()
  })

  it('should not allow to select period beginning date after ending date', async () => {
    // Given
    await render(<PreFilters {...props} />)

    // When
    const periodBeginningDateInput = screen.getByDisplayValue('15/11/2020')
    fireEvent.click(periodBeginningDateInput)
    fireEvent.click(screen.getByText('16'))

    // Then
    expect(screen.queryByDisplayValue('16/12/2020')).not.toBeInTheDocument()
  })
})
