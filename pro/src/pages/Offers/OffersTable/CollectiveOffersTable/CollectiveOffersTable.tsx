import { CollectiveOfferResponseModel } from 'apiClient/v1'
import {
  DEFAULT_COLLECTIVE_BOOKABLE_SEARCH_FILTERS,
  DEFAULT_COLLECTIVE_SEARCH_FILTERS,
  MAX_OFFERS_TO_DISPLAY,
} from 'core/Offers/constants'
import { CollectiveSearchFiltersParams } from 'core/Offers/types'
import { hasCollectiveSearchFilters } from 'core/Offers/utils/hasSearchFilters'
import { useActiveFeature } from 'hooks/useActiveFeature'
import { SortingMode, useColumnSorting } from 'hooks/useColumnSorting'
import { usePagination } from 'hooks/usePagination'
import { getOffersCountToDisplay } from 'pages/Offers/domain/getOffersCountToDisplay'
import { NoResults } from 'screens/IndividualOffersScreen/NoResults/NoResults'
import { Banner } from 'ui-kit/Banners/Banner/Banner'
import { BaseCheckbox } from 'ui-kit/form/shared/BaseCheckbox/BaseCheckbox'
import { Pagination } from 'ui-kit/Pagination/Pagination'
import { Spinner } from 'ui-kit/Spinner/Spinner'

import styles from './CollectiveOffersTable.module.scss'
import { CollectiveOffersTableBody } from './CollectiveOffersTableBody/CollectiveOffersTableBody'
import { CollectiveOffersTableHead } from './CollectiveOffersTableHead/CollectiveOffersTableHead'

type CollectiveOffersTableProps = {
  applyUrlFiltersAndRedirect: (
    filters: CollectiveSearchFiltersParams,
    isRefreshing: boolean
  ) => void
  areAllOffersSelected: boolean
  hasOffers: boolean
  isLoading: boolean
  pageCount: number
  resetFilters: () => void
  setSelectedOffer: (offer: CollectiveOfferResponseModel) => void
  toggleSelectAllCheckboxes: () => void
  urlSearchFilters: CollectiveSearchFiltersParams
  isAtLeastOneOfferChecked: boolean
  isRestrictedAsAdmin?: boolean
  selectedOffers: CollectiveOfferResponseModel[]
  offers: CollectiveOfferResponseModel[]
}

export enum CollectiveOffersSortingColumn {
  EVENT_DATE = 'EVENT_DATE',
}

const sortByEventDate = (
  offerA: CollectiveOfferResponseModel,
  offerB: CollectiveOfferResponseModel
) => {
  const bookingDateOne = offerA.dates
    ? new Date(offerA.dates.start)
    : new Date()
  const bookingDateTwo = offerB.dates
    ? new Date(offerB.dates.start)
    : new Date()
  if (bookingDateOne > bookingDateTwo) {
    return 1
  } else if (bookingDateOne < bookingDateTwo) {
    return -1
  }
  return 0
}

const sortOffers = (
  offers: CollectiveOfferResponseModel[] | undefined,
  currentSortingColumn: CollectiveOffersSortingColumn | null,
  sortingMode: SortingMode
) => {
  if (!offers) {
    return []
  }

  if (sortingMode === SortingMode.NONE) {
    return offers
  }

  const sortedOffers = offers.slice()

  switch (currentSortingColumn) {
    case CollectiveOffersSortingColumn.EVENT_DATE:
      return sortedOffers.sort(
        (a, b) =>
          sortByEventDate(a, b) * (sortingMode === SortingMode.ASC ? 1 : -1)
      )
    default:
      return sortedOffers
  }
}

const OFFERS_PER_PAGE = 10

export const CollectiveOffersTable = ({
  areAllOffersSelected,
  hasOffers,
  isLoading,
  pageCount,
  resetFilters,
  selectedOffers,
  applyUrlFiltersAndRedirect,
  setSelectedOffer,
  toggleSelectAllCheckboxes,
  urlSearchFilters,
  isAtLeastOneOfferChecked,
  isRestrictedAsAdmin = false,
  offers,
}: CollectiveOffersTableProps) => {
  const { currentSortingColumn, currentSortingMode, onColumnHeaderClick } =
    useColumnSorting<CollectiveOffersSortingColumn>()
  const isNewOffersAndBookingsActive = useActiveFeature(
    'WIP_ENABLE_NEW_COLLECTIVE_OFFERS_AND_BOOKINGS_STRUCTURE'
  )

  const defaultCollectiveFilters = isNewOffersAndBookingsActive
    ? DEFAULT_COLLECTIVE_BOOKABLE_SEARCH_FILTERS
    : DEFAULT_COLLECTIVE_SEARCH_FILTERS

  const sortedOffers = sortOffers(
    offers,
    currentSortingColumn,
    currentSortingMode
  )

  const { page, previousPage, nextPage, currentPageItems } = usePagination(
    sortedOffers,
    OFFERS_PER_PAGE,
    urlSearchFilters.page
  )

  return (
    <div>
      <div role="status">
        {offers.length > MAX_OFFERS_TO_DISPLAY && (
          <Banner type="notification-info">
            L’affichage est limité à 500 offres. Modifiez les filtres pour
            affiner votre recherche.
          </Banner>
        )}
        {hasOffers ? (
          `${getOffersCountToDisplay(offers.length)} ${
            offers.length <= 1 ? 'offre' : 'offres'
          }`
        ) : (
          <span className="visually-hidden">aucune offre trouvée</span>
        )}
      </div>
      {isLoading ? (
        <Spinner className={styles['loading-spinner']} />
      ) : (
        <>
          {hasOffers && (
            <>
              <div className={styles['select-all-container']}>
                <BaseCheckbox
                  checked={areAllOffersSelected}
                  partialCheck={
                    !areAllOffersSelected && isAtLeastOneOfferChecked
                  }
                  disabled={isRestrictedAsAdmin}
                  onChange={toggleSelectAllCheckboxes}
                  label={
                    areAllOffersSelected
                      ? 'Tout désélectionner'
                      : 'Tout sélectionner'
                  }
                />
              </div>
              <table className={styles['collective-table']}>
                <CollectiveOffersTableHead
                  onColumnHeaderClick={onColumnHeaderClick}
                  currentSortingColumn={currentSortingColumn}
                  currentSortingMode={currentSortingMode}
                />

                <CollectiveOffersTableBody
                  offers={currentPageItems}
                  selectOffer={setSelectedOffer}
                  selectedOffers={selectedOffers}
                  urlSearchFilters={urlSearchFilters}
                />
              </table>
            </>
          )}
          {hasOffers && (
            <div className={styles['offers-pagination']}>
              <Pagination
                currentPage={page}
                pageCount={pageCount}
                onPreviousPageClick={() => {
                  previousPage()
                  applyUrlFiltersAndRedirect(
                    { ...urlSearchFilters, page: page - 1 },
                    false
                  )
                }}
                onNextPageClick={() => {
                  nextPage()
                  applyUrlFiltersAndRedirect(
                    { ...urlSearchFilters, page: page + 1 },
                    false
                  )
                }}
              />
            </div>
          )}
          {!hasOffers &&
            hasCollectiveSearchFilters(
              urlSearchFilters,
              defaultCollectiveFilters
            ) && <NoResults resetFilters={resetFilters} />}
        </>
      )}
    </div>
  )
}
