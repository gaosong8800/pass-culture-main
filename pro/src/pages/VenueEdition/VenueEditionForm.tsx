import { Form, Formik, FormikConfig } from 'formik'
import { useNavigate, useLocation } from 'react-router-dom'

import { api } from 'apiClient/api'
import { isErrorAPIError, serializeApiErrors } from 'apiClient/helpers'
import { GetVenueResponseModel } from 'apiClient/v1'
import FormLayout from 'components/FormLayout'
import { Events } from 'core/FirebaseEvents/constants'
import { PATCH_SUCCESS_MESSAGE } from 'core/shared'
import useAnalytics from 'hooks/useAnalytics'
import useCurrentUser from 'hooks/useCurrentUser'
import useNotification from 'hooks/useNotification'
import { TextArea, TextInput } from 'ui-kit'
import PhoneNumberInput from 'ui-kit/form/PhoneNumberInput'

import { Accessibility } from '../VenueCreation/Accessibility/Accessibility'
import { VenueFormActionBar } from '../VenueCreation/VenueFormActionBar'

import { serializeEditVenueBodyModel } from './serializers'
import { setInitialFormValues } from './setInitialFormValues'
import { VenueEditionFormValues } from './types'
import { getValidationSchema } from './validationSchema'

interface VenueFormProps {
  venue: GetVenueResponseModel
  reloadVenueData: () => Promise<void>
}

export const VenueEditionForm = ({
  venue,
  reloadVenueData,
}: VenueFormProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const notify = useNotification()
  const { logEvent } = useAnalytics()

  const { currentUser } = useCurrentUser()

  const onSubmit: FormikConfig<VenueEditionFormValues>['onSubmit'] = async (
    values,
    formikHelpers
  ) => {
    try {
      await api.editVenue(
        venue.id,
        serializeEditVenueBodyModel(values, !venue.siret)
      )

      await reloadVenueData()

      navigate(`/structures/${venue.managingOfferer.id}/lieux/${venue.id}`)

      if (currentUser.isAdmin) {
        notify.success(PATCH_SUCCESS_MESSAGE)
      }

      logEvent?.(Events.CLICKED_SAVE_VENUE, {
        from: location.pathname,
        saved: true,
        isEdition: true,
      })
    } catch (error) {
      let formErrors
      if (isErrorAPIError(error)) {
        formErrors = error.body
      }
      const apiFieldsMap: Record<string, string> = {
        venueLabelId: 'venueLabel',
        'contact.email': 'email',
        'contact.phoneNumber': 'phoneNumber',
        'contact.website': 'webSite',
        visualDisabilityCompliant: 'accessibility.visual',
        mentalDisabilityCompliant: 'accessibility.mental',
        motorDisabilityCompliant: 'accessibility.motor',
        audioDisabilityCompliant: 'accessibility.audio',
      }

      if (!formErrors || Object.keys(formErrors).length === 0) {
        notify.error('Erreur inconnue lors de la sauvegarde du lieu.')
      } else {
        notify.error(
          'Une ou plusieurs erreurs sont présentes dans le formulaire'
        )
        formikHelpers.setErrors(serializeApiErrors(formErrors, apiFieldsMap))
        formikHelpers.setStatus('apiError')
      }

      logEvent?.(Events.CLICKED_SAVE_VENUE, {
        from: location.pathname,
        saved: false,
        isEdition: true,
      })
    }
  }

  return (
    <Formik
      initialValues={setInitialFormValues(venue)}
      onSubmit={onSubmit}
      validationSchema={getValidationSchema(venue.isVirtual)}
    >
      <Form>
        <FormLayout fullWidthActions>
          {!venue.isVirtual && (
            <FormLayout.Section
              title="À propos de votre activité"
              description={
                venue.isVirtual
                  ? undefined
                  : 'Ces informations seront affichées dans votre page lieu sur l’application pass Culture (sauf pour les lieux administratifs). Elles permettront aux jeunes d’en savoir plus sur votre lieu.'
              }
            >
              <FormLayout.Row>
                <TextArea
                  name="description"
                  label="Description"
                  placeholder="Par exemple : mon établissement propose des spectacles, de l’improvisation..."
                  maxLength={1000}
                  countCharacters
                  isOptional
                />
              </FormLayout.Row>
            </FormLayout.Section>
          )}

          {!venue.isVirtual && <Accessibility isCreatingVenue={false} />}

          {!venue.isVirtual && (
            <FormLayout.Section
              title="Contact"
              description={
                'Ces informations seront affichées dans votre page lieu, sur l’application pass Culture. ' +
                'Elles permettront aux bénéficiaires de vous contacter en cas de besoin.'
              }
            >
              <FormLayout.Row>
                <PhoneNumberInput
                  name="phoneNumber"
                  label="Téléphone"
                  isOptional
                />
              </FormLayout.Row>

              <FormLayout.Row>
                <TextInput
                  name="email"
                  label="Adresse email"
                  placeholder="email@exemple.com"
                  isOptional
                />
              </FormLayout.Row>

              <FormLayout.Row>
                <TextInput
                  name="webSite"
                  label="URL de votre site web"
                  placeholder="https://exemple.com"
                  isOptional
                />
              </FormLayout.Row>
            </FormLayout.Section>
          )}
        </FormLayout>

        <VenueFormActionBar isCreatingVenue={false} />
      </Form>
    </Formik>
  )
}
