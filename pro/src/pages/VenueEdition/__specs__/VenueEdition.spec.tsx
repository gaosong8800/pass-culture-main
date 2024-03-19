import { screen, waitForElementToBeRemoved } from '@testing-library/react'
import React from 'react'
import { Route, Routes } from 'react-router-dom'

import { api } from 'apiClient/api'
import {
  ApiError,
  GetOffererResponseModel,
  GetVenueResponseModel,
  VenueProviderResponse,
} from 'apiClient/v1'
import { ApiRequestOptions } from 'apiClient/v1/core/ApiRequestOptions'
import { ApiResult } from 'apiClient/v1/core/ApiResult'
import { Providers } from 'core/Venue/types'
import * as pcapi from 'repository/pcapi/pcapi'
import { defaultGetVenue } from 'utils/collectiveApiFactories'
import {
  RenderWithProvidersOptions,
  renderWithProviders,
} from 'utils/renderWithProviders'

import { VenueEdition } from '../VenueEdition'

const renderVenueEdition = (
  venueId: number,
  offererId: number,
  options?: RenderWithProvidersOptions
) => {
  const storeOverrides = {
    user: {
      initialized: true,
      currentUser: {
        id: 'EY',
        isAdmin: false,
      },
    },
  }

  return renderWithProviders(
    <Routes>
      <Route
        path="/structures/:offererId/lieux/:venueId/*"
        element={<VenueEdition />}
      />
      <Route path="/accueil" element={<h1>Home</h1>} />
    </Routes>,
    {
      storeOverrides,
      initialRouterEntries: [
        `/structures/${offererId}/lieux/${venueId}/edition`,
      ],
      ...options,
    }
  )
}

vi.mock('repository/pcapi/pcapi', () => ({
  loadProviders: vi.fn(),
}))

vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual('react-router-dom')) ?? {}),
  useParams: () => ({
    offererId: '1234',
    venueId: '12',
  }),
  useNavigate: vi.fn(),
}))

describe('route VenueEdition', () => {
  let venue: GetVenueResponseModel
  let venueProviders: VenueProviderResponse[]
  let providers: Providers[]
  let offerer: GetOffererResponseModel

  beforeEach(() => {
    venue = {
      ...defaultGetVenue,
      id: 12,
      publicName: 'Cinéma des iles',
      dmsToken: 'dms-token-12345',
      isPermanent: true,
    }

    venueProviders = [
      {
        id: 1,
        isActive: true,
        isFromAllocineProvider: false,
        lastSyncDate: undefined,
        nOffers: 0,
        venueId: 2,
        venueIdAtOfferProvider: 'cdsdemorc1',
        provider: {
          name: 'Ciné Office',
          id: 12,
          hasOffererProvider: false,
          isActive: true,
        },
        quantity: 0,
        isDuo: true,
        price: 0,
      },
    ]

    providers = [
      {
        id: 12,
        isActive: true,
        name: 'name',
      },
    ] as Providers[]

    offerer = {
      id: 13,
    } as GetOffererResponseModel

    vi.spyOn(api, 'getVenue').mockResolvedValue(venue)
    vi.spyOn(pcapi, 'loadProviders').mockResolvedValue(providers)
    vi.spyOn(api, 'listVenueProviders').mockResolvedValue({
      venue_providers: venueProviders,
    })
    vi.spyOn(api, 'getOfferer').mockResolvedValue(offerer)
    vi.spyOn(api, 'getVenueTypes').mockResolvedValue([])
    vi.spyOn(api, 'fetchVenueLabels').mockResolvedValue([])
    vi.spyOn(api, 'listOffers').mockResolvedValue([])
  })

  it('should call getVenue and display Venue Form screen on success', async () => {
    renderVenueEdition(venue.id, offerer.id)

    const venuePublicName = await screen.findByRole('heading', {
      name: 'Cinéma des iles',
    })
    expect(api.getVenue).toHaveBeenCalledWith(12)
    expect(venuePublicName).toBeInTheDocument()
  })

  it('should check none accessibility', async () => {
    vi.spyOn(api, 'getVenue').mockResolvedValueOnce({
      ...venue,
      siret: undefined,
      visualDisabilityCompliant: false,
      mentalDisabilityCompliant: false,
      audioDisabilityCompliant: false,
      motorDisabilityCompliant: false,
    })

    renderVenueEdition(venue.id, offerer.id)

    await screen.findByRole('heading', {
      name: 'Cinéma des iles',
    })

    expect(
      screen.getByLabelText('Non accessible', { exact: false })
    ).toBeChecked()
  })

  it('should not check none accessibility if every accessibility parameters are null', async () => {
    vi.spyOn(api, 'getVenue').mockResolvedValueOnce({
      ...venue,
      visualDisabilityCompliant: null,
      mentalDisabilityCompliant: null,
      audioDisabilityCompliant: null,
      motorDisabilityCompliant: null,
    })

    renderVenueEdition(venue.id, offerer.id)

    await screen.findByRole('heading', {
      name: 'Cinéma des iles',
    })

    expect(
      screen.getByLabelText('Non accessible', { exact: false })
    ).not.toBeChecked()
  })

  it('should not render reimbursement fields when FF bank details is enabled and venue has no siret', async () => {
    vi.spyOn(api, 'getVenue').mockResolvedValueOnce({
      ...venue,
      siret: '11111111111111',
    })

    renderVenueEdition(venue.id, offerer.id, {
      features: ['WIP_ENABLE_NEW_BANK_DETAILS_JOURNEY'],
    })

    await screen.findByRole('heading', {
      name: 'Cinéma des iles',
    })

    expect(
      screen.queryByText(/Barème de remboursement/)
    ).not.toBeInTheDocument()
  })

  it('should return to home when not able to get venue informations', async () => {
    vi.spyOn(api, 'getVenue').mockRejectedValue(
      new ApiError(
        {} as ApiRequestOptions,
        {
          status: 404,
          body: {
            global: ['error'],
          },
        } as ApiResult,
        ''
      )
    )
    renderVenueEdition(venue.id, offerer.id)

    await waitForElementToBeRemoved(screen.getByTestId('spinner'))
    expect(api.getVenue).toHaveBeenCalledTimes(1)

    expect(await screen.findByText('Home')).toBeInTheDocument()
  })

  it('should display Opening hours section if WIP_OPENING_HOURS feature flag is enabled and venue is permanent', async () => {
    renderVenueEdition(venue.id, offerer.id, {
      features: ['WIP_OPENING_HOURS'],
    })

    await waitForElementToBeRemoved(screen.getByTestId('spinner'))

    expect(screen.getByText("Horaires d'ouverture")).toBeInTheDocument()
  })

  it('should not display Opening hours section if WIP_OPENING_HOURS feature flag is disabled', async () => {
    renderVenueEdition(venue.id, offerer.id)

    await waitForElementToBeRemoved(screen.getByTestId('spinner'))

    expect(screen.queryByText("Horaires d'ouverture")).not.toBeInTheDocument()
  })
})
