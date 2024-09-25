import {
  GET_COLLECTIVE_OFFERS_BOOKABLE_QUERY_KEY,
  GET_COLLECTIVE_OFFERS_QUERY_KEY,
  GET_COLLECTIVE_OFFERS_TEMPLATE_QUERY_KEY,
} from 'config/swrQueryKeys'

import {
  DEFAULT_COLLECTIVE_BOOKABLE_SEARCH_FILTERS,
  DEFAULT_COLLECTIVE_SEARCH_FILTERS,
  DEFAULT_COLLECTIVE_TEMPLATE_SEARCH_FILTERS,
} from '../constants'
import { CollectiveSearchFiltersParams } from '../types'

export type GetCollectiveOffersSwrKeysProps = {
  isNewOffersAndBookingsActive: boolean
  isInTemplateOffersPage: boolean
  isNewInterfaceActive: boolean
  urlSearchFilters: CollectiveSearchFiltersParams
  selectedOffererId: number | null
}

//  Make sure that the exact same query key is used across collective offers list actions
export function getCollectiveOffersSwrKeys({
  isNewOffersAndBookingsActive,
  isInTemplateOffersPage,
  urlSearchFilters,
  isNewInterfaceActive,
  selectedOffererId,
}: GetCollectiveOffersSwrKeysProps): [string, CollectiveSearchFiltersParams] {
  const collectiveOffersListQueryKey = isNewOffersAndBookingsActive
    ? isInTemplateOffersPage
      ? GET_COLLECTIVE_OFFERS_TEMPLATE_QUERY_KEY
      : GET_COLLECTIVE_OFFERS_BOOKABLE_QUERY_KEY
    : GET_COLLECTIVE_OFFERS_QUERY_KEY

  const defaultCollectiveFilters = isNewOffersAndBookingsActive
    ? isInTemplateOffersPage
      ? DEFAULT_COLLECTIVE_TEMPLATE_SEARCH_FILTERS
      : DEFAULT_COLLECTIVE_BOOKABLE_SEARCH_FILTERS
    : DEFAULT_COLLECTIVE_SEARCH_FILTERS

  const apiFilters: CollectiveSearchFiltersParams = {
    ...defaultCollectiveFilters,
    ...urlSearchFilters,
    ...(isNewInterfaceActive
      ? { offererId: selectedOffererId?.toString() ?? 'all' }
      : {}),
    page: undefined,
  }

  return [collectiveOffersListQueryKey, apiFilters]
}
