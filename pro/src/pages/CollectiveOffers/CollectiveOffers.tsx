import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'

import { api } from 'apiClient/api'
import { CollectiveOfferType } from 'apiClient/v1'
import { Layout } from 'app/App/layout/Layout'
import {
  GET_OFFERER_QUERY_KEY,
  GET_VENUES_QUERY_KEY,
} from 'commons/config/swrQueryKeys'
import { DEFAULT_PAGE } from 'commons/core/Offers/constants'
import { useDefaultCollectiveSearchFilters } from 'commons/core/Offers/hooks/useDefaultCollectiveSearchFilters'
import { useQueryCollectiveSearchFilters } from 'commons/core/Offers/hooks/useQuerySearchFilters'
import { CollectiveSearchFiltersParams } from 'commons/core/Offers/types'
import { computeCollectiveOffersUrl } from 'commons/core/Offers/utils/computeCollectiveOffersUrl'
import { getCollectiveOffersSwrKeys } from 'commons/core/Offers/utils/getCollectiveOffersSwrKeys'
import { hasCollectiveSearchFilters } from 'commons/core/Offers/utils/hasSearchFilters'
import { serializeApiCollectiveFilters } from 'commons/core/Offers/utils/serializer'
import { useActiveFeature } from 'commons/hooks/useActiveFeature'
import { useCurrentUser } from 'commons/hooks/useCurrentUser'
import { selectCurrentOffererId } from 'commons/store/user/selectors'
import { formatAndOrderVenues } from 'repository/venuesService'
import { Spinner } from 'ui-kit/Spinner/Spinner'

import { CollectiveOffersScreen } from './components/CollectiveOffersScreen/CollectiveOffersScreen'

export const CollectiveOffers = (): JSX.Element => {
  const isNewOffersAndBookingsActive = useActiveFeature(
    'WIP_ENABLE_NEW_COLLECTIVE_OFFERS_AND_BOOKINGS_STRUCTURE'
  )

  const navigate = useNavigate()
  const { currentUser } = useCurrentUser()
  const offererId = useSelector(selectCurrentOffererId)?.toString()

  const defaultCollectiveFilters = useDefaultCollectiveSearchFilters()

  const urlSearchFilters = useQueryCollectiveSearchFilters({
    ...defaultCollectiveFilters,
    offererId: offererId ?? 'all',
  })

  const currentPageNumber = urlSearchFilters.page ?? DEFAULT_PAGE

  const offererQuery = useSWR(
    [GET_OFFERER_QUERY_KEY, offererId],
    ([, offererIdParam]) =>
      offererId === defaultCollectiveFilters.offererId
        ? null
        : api.getOfferer(Number(offererIdParam)),
    { fallbackData: null }
  )
  const offerer = offererQuery.data

  const { data } = useSWR(
    [GET_VENUES_QUERY_KEY, offerer?.id],
    ([, offererIdParam]) => api.getVenues(null, null, offererIdParam),
    { fallbackData: { venues: [] } }
  )

  const venues = formatAndOrderVenues(data.venues)

  const redirectWithUrlFilters = (filters: CollectiveSearchFiltersParams) => {
    navigate(computeCollectiveOffersUrl(filters, defaultCollectiveFilters), {
      replace: true,
    })
  }

  const isFilterByVenueOrOfferer = hasCollectiveSearchFilters(
    urlSearchFilters,
    defaultCollectiveFilters,
    ['venueId']
  )
  //  Admin users are not allowed to check all offers at once or to use the status filter for performance reasons. Unless there is a venue or offerer filter active.
  const isRestrictedAsAdmin = currentUser.isAdmin && !isFilterByVenueOrOfferer

  const collectiveOffersQueryKeys = getCollectiveOffersSwrKeys({
    isNewOffersAndBookingsActive,
    isInTemplateOffersPage: false,
    urlSearchFilters,
    selectedOffererId: offererId ?? '',
  })

  const apiFilters: CollectiveSearchFiltersParams = {
    ...defaultCollectiveFilters,
    ...urlSearchFilters,
    ...(isRestrictedAsAdmin ? { status: [] } : {}),
    ...{ offererId: offererId?.toString() ?? 'all' },
  }
  delete apiFilters.page

  const offersQuery = useSWR(
    collectiveOffersQueryKeys,
    () => {
      const {
        nameOrIsbn,
        offererId,
        venueId,
        categoryId,
        status,
        creationMode,
        periodBeginningDate,
        periodEndingDate,
        collectiveOfferType,
        format,
      } = serializeApiCollectiveFilters(apiFilters, defaultCollectiveFilters)

      return api.getCollectiveOffers(
        nameOrIsbn,
        offererId,
        status,
        venueId,
        categoryId,
        creationMode,
        periodBeginningDate,
        periodEndingDate,
        isNewOffersAndBookingsActive
          ? CollectiveOfferType.OFFER
          : collectiveOfferType,
        format
      )
    },
    { fallbackData: [] }
  )

  return (
    <Layout>
      {/* When the venues are cached for a given offerer, we still need to reset the Screen component.
      SWR isLoading is only true when the data is not cached, while isValidating is always set to true when the key is updated */}
      {offererQuery.isLoading || offererQuery.isValidating ? (
        <Spinner />
      ) : (
        <CollectiveOffersScreen
          currentPageNumber={currentPageNumber}
          currentUser={currentUser}
          initialSearchFilters={apiFilters}
          isLoading={offersQuery.isLoading}
          offerer={offerer}
          offers={offersQuery.data}
          redirectWithUrlFilters={redirectWithUrlFilters}
          urlSearchFilters={urlSearchFilters}
          venues={venues}
          isRestrictedAsAdmin={isRestrictedAsAdmin}
        />
      )}
    </Layout>
  )
}

// Lazy-loaded by react-router-dom
// ts-unused-exports:disable-next-line
export const Component = CollectiveOffers
