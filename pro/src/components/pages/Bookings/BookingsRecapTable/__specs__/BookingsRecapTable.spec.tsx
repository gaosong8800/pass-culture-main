import '@testing-library/jest-dom'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Provider } from 'react-redux'
import type { Store } from 'redux'

import { BookingRecapStatus } from 'apiClient/v1'
import { RootState } from 'store/reducers'
import { configureTestStore } from 'store/testUtils'

import BookingsRecapTable from '../BookingsRecapTable'
import { EMPTY_FILTER_VALUE } from '../Filters/_constants'
import * as constants from '../NB_BOOKINGS_PER_PAGE'
import * as filterBookingsRecap from '../utils/filterBookingsRecap'

const mockedBooking = {
  stock: {
    offer_name: 'Avez-vous déjà vu',
    type: 'thing',
    stock_identifier: '1',
    offer_identifier: '1',
    offer_is_educational: false,
  },
  beneficiary: {
    lastname: 'Klepi',
    firstname: 'Sonia',
    email: 'sonia.klepi@example.com',
  },
  booking_amount: 10,
  booking_date: '2020-04-03T12:00:00Z',
  booking_token: 'ZEHBGD',
  booking_status: BookingRecapStatus.VALIDATED,
  booking_is_duo: true,
  venue: {
    identifier: 'AE',
    name: 'Librairie Kléber',
  },
  booking_status_history: [
    {
      status: BookingRecapStatus.BOOKED,
      date: '2020-04-03T12:00:00Z',
    },
    {
      status: BookingRecapStatus.VALIDATED,
      date: '2020-04-23T12:00:00Z',
    },
  ],
}

const otherBooking = {
  stock: {
    offer_name: 'Autre nom offre',
    type: 'thing',
    stock_identifier: '2',
    offer_identifier: '2',
    offer_is_educational: false,
  },
  beneficiary: {
    lastname: 'Parjeot',
    firstname: 'Micheline',
    email: 'michelinedu72@example.com',
  },
  booking_amount: 10,
  booking_date: '2020-04-03T12:00:00Z',
  booking_token: 'ABCDE',
  booking_status: BookingRecapStatus.VALIDATED,
  booking_is_duo: true,
  venue: {
    identifier: 'AE',
    name: 'Librairie Kléber',
  },
  booking_status_history: [
    {
      status: BookingRecapStatus.BOOKED,
      date: '2020-04-03T12:00:00Z',
    },
    {
      status: BookingRecapStatus.VALIDATED,
      date: '2020-05-06T12:00:00Z',
    },
  ],
}

describe('components | BookingsRecapTable', () => {
  let store: Store<Partial<RootState>>

  beforeEach(() => {
    store = configureTestStore({})
  })

  it('should filter when filters change', async () => {
    const bookingsRecap = [mockedBooking, otherBooking]
    const props = {
      bookingsRecap: bookingsRecap,
      isLoading: false,
    }
    render(
      <Provider store={store}>
        <BookingsRecapTable {...props} />
      </Provider>
    )

    // 2 lines = 12 cells
    expect(screen.getAllByRole('cell')).toHaveLength(12)

    await userEvent.type(screen.getByRole('textbox'), 'Autre nom offre')
    await waitFor(() => {
      // 1 line = 6 cells
      expect(screen.getAllByRole('cell')).toHaveLength(6)
    })

    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'Bénéficiaire' })
    )
    await userEvent.clear(screen.getByRole('textbox'))

    await waitFor(() => {
      // 2 lines = 12 cells
      expect(screen.getAllByRole('cell')).toHaveLength(12)
    })
    await userEvent.type(screen.getByRole('textbox'), 'Parjeot')
    await waitFor(() => {
      // 1 line = 6 cells
      expect(screen.getAllByRole('cell')).toHaveLength(6)
    })
  })

  it('should filter bookings on render', () => {
    jest.mock('../utils/filterBookingsRecap', () => jest.fn())

    // Given
    const props = {
      bookingsRecap: [mockedBooking],
      isLoading: false,
      locationState: {
        statuses: ['booked', 'cancelled'],
      },
    }
    jest.spyOn(filterBookingsRecap, 'default').mockReturnValue([])

    // When
    render(
      <Provider store={store}>
        <BookingsRecapTable {...props} />
      </Provider>
    )

    // Then
    expect(filterBookingsRecap.default).toHaveBeenCalledWith(
      props.bookingsRecap,
      expect.objectContaining({
        bookingStatus: props.locationState.statuses,
        bookingBeneficiary: EMPTY_FILTER_VALUE,
        bookingToken: EMPTY_FILTER_VALUE,
        offerISBN: EMPTY_FILTER_VALUE,
        offerName: EMPTY_FILTER_VALUE,
      })
    )
  })

  it('should render the expected table with max given number of hits per page', () => {
    // Given
    // @ts-ignore
    // eslint-disable-next-line
    constants.NB_BOOKINGS_PER_PAGE = 1
    const bookingsRecap = [mockedBooking, otherBooking]
    jest.spyOn(filterBookingsRecap, 'default').mockReturnValue(bookingsRecap)
    const props = {
      bookingsRecap: bookingsRecap,
      isLoading: false,
    }

    // When
    render(
      <Provider store={store}>
        <BookingsRecapTable {...props} />
      </Provider>
    )

    // Then
    // 1 line = 6 cells
    expect(screen.getAllByRole('cell')).toHaveLength(6)
  })
})
