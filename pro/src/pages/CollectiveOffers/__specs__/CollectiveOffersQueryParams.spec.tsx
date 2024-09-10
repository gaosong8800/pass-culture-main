import {
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import * as router from 'react-router-dom'

import { api } from 'apiClient/api'
import {
  CollectiveOfferResponseModel,
  CollectiveOffersStockResponseModel,
} from 'apiClient/v1'
import { DEFAULT_COLLECTIVE_SEARCH_FILTERS } from 'core/Offers/constants'
import { CollectiveSearchFiltersParams } from 'core/Offers/types'
import { computeCollectiveOffersUrl } from 'core/Offers/utils/computeCollectiveOffersUrl'
import { collectiveOfferFactory } from 'utils/collectiveApiFactories'
import {
  defaultGetOffererResponseModel,
  venueListItemFactory,
} from 'utils/individualApiFactories'
import { renderWithProviders } from 'utils/renderWithProviders'
import { sharedCurrentUserFactory } from 'utils/storeFactories'

import { CollectiveOffers } from '../CollectiveOffers'

//FIX ME : extract inital values and constant to reduce code duplication with CollectiveOffers.spec.tsx

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: vi.fn(),
}))

const renderOffers = async (
  filters: Partial<CollectiveSearchFiltersParams> = DEFAULT_COLLECTIVE_SEARCH_FILTERS
) => {
  const route = computeCollectiveOffersUrl(filters)
  renderWithProviders(
    <router.Routes>
      <router.Route path="/offres/collectives" element={<CollectiveOffers />} />

      <router.Route
        path="/offres"
        element={
          <>
            <h1>Offres individuelles</h1>
          </>
        }
      />
    </router.Routes>,
    {
      user: sharedCurrentUserFactory(),
      initialRouterEntries: [route],
    }
  )

  await waitForElementToBeRemoved(() => screen.queryByTestId('spinner'))

  return {
    history,
  }
}

const proVenues = [
  venueListItemFactory({
    id: 1,
    name: 'Ma venue',
  }),
  venueListItemFactory({
    id: 2,
    name: 'Mon autre venue',
  }),
]

vi.mock('repository/venuesService', async () => ({
  ...(await vi.importActual('repository/venuesService')),
}))

describe('route CollectiveOffers', () => {
  let offersRecap: CollectiveOfferResponseModel[]
  const stocks: Array<CollectiveOffersStockResponseModel> = [
    {
      beginningDatetime: String(new Date()),
      hasBookingLimitDatetimePassed: false,
      remainingQuantity: 1,
    },
  ]
  const mockNavigate = vi.fn()

  beforeEach(() => {
    offersRecap = [collectiveOfferFactory({ stocks })]
    vi.spyOn(api, 'getCollectiveOffers').mockResolvedValue(offersRecap)
    vi.spyOn(router, 'useNavigate').mockReturnValue(mockNavigate)
    vi.spyOn(api, 'listOfferersNames').mockResolvedValue({ offerersNames: [] })
    vi.spyOn(api, 'getVenues').mockResolvedValue({ venues: proVenues })
  })

  describe('url query params', () => {
    it('should have page value when page value is not first page', async () => {
      const offersRecap = Array.from({ length: 11 }, () =>
        collectiveOfferFactory({ stocks })
      )
      vi.spyOn(api, 'getCollectiveOffers').mockResolvedValueOnce(offersRecap)
      await renderOffers()
      const nextPageIcon = screen.getByRole('button', { name: 'Page suivante' })

      await userEvent.click(nextPageIcon)

      expect(mockNavigate).toHaveBeenCalledWith(
        '/offres/collectives?page=2&statut=en-attente&statut=refusee&statut=active&statut=inactive&statut=prereservee&statut=reservee&statut=expiree&statut=terminee&statut=brouillon',
        {
          replace: true,
        }
      )
    })

    it('should have offer name value when name search value is not an empty string', async () => {
      await renderOffers()

      await userEvent.type(
        screen.getByPlaceholderText('Rechercher par nom d’offre'),
        'AnyWord'
      )
      await userEvent.click(screen.getByText('Rechercher'))

      expect(mockNavigate).toHaveBeenCalledWith(
        '/offres/collectives?nom-ou-isbn=AnyWord&statut=en-attente&statut=refusee&statut=active&statut=inactive&statut=prereservee&statut=reservee&statut=expiree&statut=terminee&statut=brouillon',
        {
          replace: true,
        }
      )
    })

    it('should have offer name value be removed when name search value is an empty string', async () => {
      await renderOffers()

      await userEvent.clear(
        screen.getByPlaceholderText('Rechercher par nom d’offre')
      )
      await userEvent.click(screen.getByText('Rechercher'))

      expect(mockNavigate).toHaveBeenCalledWith(
        '/offres/collectives?statut=en-attente&statut=refusee&statut=active&statut=inactive&statut=prereservee&statut=reservee&statut=expiree&statut=terminee&statut=brouillon',
        {
          replace: true,
        }
      )
    })

    it('should have venue value when user filters by venue', async () => {
      await renderOffers()
      const firstVenueOption = screen.getByRole('option', {
        name: proVenues[0].name,
      })
      const venueSelect = screen.getByLabelText('Lieu')

      await userEvent.selectOptions(venueSelect, firstVenueOption)
      await userEvent.click(screen.getByText('Rechercher'))

      expect(mockNavigate).toHaveBeenCalledWith(
        `/offres/collectives?lieu=1&statut=en-attente&statut=refusee&statut=active&statut=inactive&statut=prereservee&statut=reservee&statut=expiree&statut=terminee&statut=brouillon`,
        {
          replace: true,
        }
      )
    })

    it('should have venue value be removed when user asks for all venues', async () => {
      // Given
      vi.spyOn(api, 'getCollectiveOffers').mockResolvedValueOnce(offersRecap)
      await renderOffers()
      const firstTypeOption = screen.getByRole('option', {
        name: 'Concert',
      })
      const formatSelect = screen.getByRole('combobox', {
        name: 'Format',
      })
      // When
      await userEvent.selectOptions(formatSelect, firstTypeOption)
      await userEvent.click(screen.getByText('Rechercher'))

      expect(mockNavigate).toHaveBeenCalledWith(
        '/offres/collectives?format=Concert&statut=en-attente&statut=refusee&statut=active&statut=inactive&statut=prereservee&statut=reservee&statut=expiree&statut=terminee&statut=brouillon',
        {
          replace: true,
        }
      )
    })

    it('should have the status in the url value when user filters by status', async () => {
      vi.spyOn(api, 'getCollectiveOffers').mockResolvedValueOnce(offersRecap)
      await renderOffers()

      await userEvent.click(
        screen.getByText('Statut', {
          selector: 'span',
        })
      )
      const list = screen.getByTestId('list')
      await userEvent.click(within(list).getByText('Réservée'))

      await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

      expect(mockNavigate).toHaveBeenCalledWith(
        '/offres/collectives?statut=en-attente&statut=refusee&statut=active&statut=inactive&statut=prereservee&statut=expiree&statut=terminee&statut=brouillon',
        {
          replace: true,
        }
      )
    })

    it('should have the status in the url value when user filters by multiple statuses', async () => {
      vi.spyOn(api, 'getCollectiveOffers').mockResolvedValueOnce(offersRecap)
      await renderOffers()

      await userEvent.click(
        screen.getByText('Statut', {
          selector: 'span',
        })
      )
      const list = screen.getByTestId('list')
      await userEvent.click(within(list).getByText('Réservée'))
      await userEvent.click(within(list).getByText('Validation en attente'))
      await userEvent.click(within(list).getByText('Archivée'))

      await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

      expect(mockNavigate).toHaveBeenCalledWith(
        '/offres/collectives?statut=refusee&statut=active&statut=inactive&statut=prereservee&statut=expiree&statut=terminee&statut=brouillon&statut=archivee',
        {
          replace: true,
        }
      )
    })

    it('should have offerer filter when user filters by offerer', async () => {
      const filters = { offererId: 'A4' }
      vi.spyOn(api, 'getOfferer').mockResolvedValueOnce({
        ...defaultGetOffererResponseModel,
        name: 'La structure',
      })

      await renderOffers(filters)

      const offererFilter = screen.getByText('La structure')
      expect(offererFilter).toBeInTheDocument()
    })

    it('should have offerer value be removed when user removes offerer filter', async () => {
      const filters = { offererId: 'A4' }
      vi.spyOn(api, 'getOfferer').mockResolvedValueOnce({
        ...defaultGetOffererResponseModel,
        name: 'La structure',
      })
      await renderOffers(filters)

      await userEvent.click(screen.getByTestId('remove-offerer-filter'))

      expect(mockNavigate).toHaveBeenCalledWith(
        '/offres/collectives?statut=en-attente&statut=refusee&statut=active&statut=inactive&statut=prereservee&statut=reservee&statut=expiree&statut=terminee&statut=brouillon',
        {
          replace: true,
        }
      )
    })
  })
})
