import * as Dialog from '@radix-ui/react-dialog'
import { FormikProvider, useFormik } from 'formik'

import { api } from 'apiClient/api'
import { ManagedVenues } from 'apiClient/v1'
import { useActiveFeature } from 'commons/hooks/useActiveFeature'
import { useNotification } from 'commons/hooks/useNotification'
import { Button } from 'ui-kit/Button/Button'
import { ButtonVariant } from 'ui-kit/Button/types'
import { Callout } from 'ui-kit/Callout/Callout'
import { Select } from 'ui-kit/form/Select/Select'

import styles from './PricingPointDialog.module.scss'
import { getValidationSchema } from './validationSchema'

type PricingPointFormValues = {
  pricingPointId?: string
}

type PricingPointDialogProps = {
  selectedVenue: ManagedVenues | null
  venues: ManagedVenues[]
  closeDialog: () => void
  updateVenuePricingPoint: (venueId: number) => void
}

export const PricingPointDialog = ({
  selectedVenue,
  venues,
  closeDialog,
  updateVenuePricingPoint,
}: PricingPointDialogProps) => {
  const notification = useNotification()
  const isOfferAddressEnabled = useActiveFeature('WIP_ENABLE_OFFER_ADDRESS')
  const formik = useFormik<PricingPointFormValues>({
    initialValues: {
      pricingPointId: undefined,
    },
    onSubmit: async ({ pricingPointId }) => {
      if (!selectedVenue) {
        return
      }
      try {
        await api.linkVenueToPricingPoint(selectedVenue.id, {
          pricingPointId: Number(pricingPointId),
        })
        updateVenuePricingPoint(selectedVenue.id)
        closeDialog()
      } catch {
        notification.error(
          'Une erreur est survenue. Merci de réessayer plus tard'
        )
      }
    },
    validationSchema: getValidationSchema({ isOfferAddressEnabled }),
  })

  if (!selectedVenue) {
    return
  }

  const venuesOptions = [
    {
      label: `Sélectionner ${isOfferAddressEnabled ? 'une structure' : 'un lieu'} dans la liste`,
      value: '',
    },
    ...venues.map((venue) => ({
      label: `${venue.name} - ${venue.siret}`,
      value: venue.id.toString(),
    })),
  ]

  return (
    <div className={styles.dialog}>
      <Dialog.Title asChild>
        <h1 className={styles['callout-title']}>
          Sélectionnez un SIRET pour{' '}
          {isOfferAddressEnabled ? 'la structure' : 'le lieu'} “
          {selectedVenue.commonName}”{' '}
        </h1>
      </Dialog.Title>
      <Callout
        className={styles['callout']}
        links={[
          {
            href: 'https://aide.passculture.app/hc/fr/articles/4413973462929--Acteurs-Culturels-Comment-rattacher-mes-points-de-remboursement-et-mes-coordonn%C3%A9es-bancaires-%C3%A0-un-SIRET-de-r%C3%A9f%C3%A9rence-',
            isExternal: true,
            label: `Comment ajouter vos coordonnées bancaires sur ${isOfferAddressEnabled ? 'une structure' : 'un lieu'} sans SIRET ?`,
          },
        ]}
      >
        Comme indiqué dans nos CGUs, le barème de remboursement se définit sur
        la base d’un établissement et donc d’un SIRET. Afin de vous faire
        rembourser les offres de{' '}
        {isOfferAddressEnabled ? 'cette structure' : 'ce lieu'}, vous devez
        sélectionner le SIRET à partir duquel sera calculé votre taux de
        remboursement. Attention, vous ne pourrez plus modifier votre choix
        après validation.{' '}
      </Callout>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className={styles['dialog-form']}>
          <Select
            id="pricingPointId"
            name="pricingPointId"
            label={`${isOfferAddressEnabled ? 'Structure avec SIRET utilisée' : 'Lieu avec SIRET utilisé'} pour le calcul de votre barème de remboursement`}
            options={venuesOptions}
            className={styles['venues-select']}
          />
          <div className={styles['dialog-actions']}>
            <Dialog.Close asChild>
              <Button variant={ButtonVariant.SECONDARY}>Annuler</Button>
            </Dialog.Close>
            <Button type="submit">Valider la sélection</Button>
          </div>
        </form>
      </FormikProvider>
    </div>
  )
}
