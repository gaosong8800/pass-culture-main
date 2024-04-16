import React, { createContext, useContext, useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import useSWR from 'swr'

import { api } from 'apiClient/api'
import {
  CategoryResponseModel,
  GetIndividualOfferResponseModel,
  GetOffererNameResponseModel,
  MusicTypeResponse,
  SubcategoryResponseModel,
} from 'apiClient/v1'
import {
  GET_CATEGORIES_QUERY_KEY,
  GET_MUSIC_TYPES_QUERY_KEY,
} from 'config/swrQueryKeys'
import { IndividualOfferWizardLoaderData } from 'pages/IndividualOfferWizard/IndividualOfferWizard'
import Spinner from 'ui-kit/Spinner/Spinner'

export interface IndividualOfferContextValues {
  offerId: number | null
  offer: GetIndividualOfferResponseModel | null
  categories: CategoryResponseModel[]
  subCategories: SubcategoryResponseModel[]
  subcategory?: SubcategoryResponseModel
  setSubcategory: (p?: SubcategoryResponseModel) => void
  offerOfferer?: GetOffererNameResponseModel | null
  musicTypes: MusicTypeResponse[]
}

export const IndividualOfferContext =
  createContext<IndividualOfferContextValues>({
    offerId: null,
    offer: null,
    categories: [],
    subCategories: [],
    setSubcategory: () => {},
    musicTypes: [],
  })

export const useIndividualOfferContext = () => {
  return useContext(IndividualOfferContext)
}

interface IndividualOfferContextProviderProps {
  children: React.ReactNode
}

export function IndividualOfferContextProvider({
  children,
}: IndividualOfferContextProviderProps) {
  const { offer } = useLoaderData() as IndividualOfferWizardLoaderData

  const offerer = offer ? offer.venue.managingOfferer : null

  const categoriesQuery = useSWR(
    [GET_CATEGORIES_QUERY_KEY],
    () => api.getCategories(),
    { fallbackData: { categories: [], subcategories: [] } }
  )

  const musicTypesQuery = useSWR(
    GET_MUSIC_TYPES_QUERY_KEY,
    () => api.getMusicTypes(),
    {
      fallbackData: [],
    }
  )

  const [subcategory, setSubcategory] = useState<SubcategoryResponseModel>()

  if (categoriesQuery.isLoading) {
    return <Spinner />
  }

  return (
    <IndividualOfferContext.Provider
      value={{
        offerId: offer?.id || null,
        offer,
        categories: categoriesQuery.data.categories,
        subCategories: categoriesQuery.data.subcategories,
        musicTypes: musicTypesQuery.data,
        offerOfferer: offerer,
        subcategory,
        setSubcategory,
      }}
    >
      {children}
    </IndividualOfferContext.Provider>
  )
}
