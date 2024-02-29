import React from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { AppLayout } from 'app/AppLayout'
import { setDefaultInitialFormValues } from 'components/VenueCreationForm'
import useGetOfferer from 'core/Offerers/getOffererAdapter/useGetOfferer'
import { useGetVenueTypes } from 'core/Venue/adapters/getVenueTypeAdapter'
import useNotification from 'hooks/useNotification'
import { VenueCreationFormScreen } from 'screens/VenueForm/VenueCreationFormScreen'
import Spinner from 'ui-kit/Spinner/Spinner'

export const VenueCreation = (): JSX.Element | null => {
  const homePath = '/accueil'
  const { offererId } = useParams<{ offererId: string }>()
  const notify = useNotification()

  const initialValues = setDefaultInitialFormValues()

  const {
    isLoading: isLoadingOfferer,
    error: errorOfferer,
    data: offerer,
  } = useGetOfferer(offererId)
  const {
    isLoading: isLoadingVenueTypes,
    error: errorVenueTypes,
    data: venueTypes,
  } = useGetVenueTypes()

  if (errorOfferer || errorVenueTypes) {
    const loadingError = [errorOfferer, errorVenueTypes].find(
      (error) => error !== undefined
    )
    if (loadingError !== undefined) {
      notify.error(loadingError.message)
    }
    return <Navigate to={homePath} />
  }

  return (
    <AppLayout layout={'sticky-actions'}>
      {isLoadingOfferer || isLoadingVenueTypes ? (
        <Spinner />
      ) : (
        <VenueCreationFormScreen
          initialValues={initialValues}
          offerer={offerer}
          venueTypes={venueTypes}
        />
      )}
    </AppLayout>
  )
}

// Lazy-loaded by react-router-dom
// ts-unused-exports:disable-next-line
export const Component = VenueCreation
