import { FormikProvider, useFormik } from 'formik'
import React from 'react'

import FormLayout from 'components/FormLayout'
import { IOfferIndividual } from 'core/Offers/types'
import { CalendarIcon, CircleArrowIcon } from 'icons'
import {
  Button,
  DatePicker,
  RadioButton,
  Select,
  SubmitButton,
  TextInput,
  TimePicker,
} from 'ui-kit'
import { ButtonVariant, IconPositionEnum } from 'ui-kit/Button/types'
import { BaseRadioVariant } from 'ui-kit/form/shared/BaseRadio/types'

import { getPriceCategoryOptions } from '../StocksEventEdition/StocksEventEdition'

import { computeInitialValues } from './form/computeInitialValues'
import { RecurrenceType } from './form/types'
import { validationSchema } from './form/validationSchema'
import styles from './RecurrenceForm.module.scss'

interface Props {
  offer: IOfferIndividual
  onCancel: () => void
  onConfirm: () => void
}

export const RecurrenceForm = ({
  offer,
  onCancel,
  onConfirm,
}: Props): JSX.Element => {
  const priceCategoryOptions = getPriceCategoryOptions(offer)
  const formik = useFormik({
    initialValues: computeInitialValues(priceCategoryOptions),
    onSubmit: onConfirm,
    validationSchema,
  })

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <FormLayout.Section title="Ajouter une récurrence">
          <div className={styles['legend']}>
            <CalendarIcon className={styles['legend-icon']} /> Cet évènement
            aura lieu
          </div>

          <FormLayout.Row inline>
            <RadioButton
              variant={BaseRadioVariant.SECONDARY}
              label="Une seule fois"
              name="recurrenceType"
              value={RecurrenceType.UNIQUE}
              withBorder
            />

            <RadioButton
              variant={BaseRadioVariant.SECONDARY}
              label="Tous les jours"
              name="recurrenceType"
              value={RecurrenceType.UNIQUE}
              withBorder
            />
          </FormLayout.Row>

          <FormLayout.Row>
            <DatePicker name="startingDate" label="Date de l’évènement" />
          </FormLayout.Row>

          <div className={styles['legend']}>
            <CalendarIcon className={styles['legend-icon']} /> Créneaux horaires
            (pour l’ensemble de ces dates)
          </div>

          <FormLayout.Row>
            {formik.values.beginningTimes.map((beginningTime, index) => (
              <TimePicker
                key={index}
                label={`Horaire ${index + 1}`}
                name={`beginningTimes[${index}]`}
              />
            ))}
          </FormLayout.Row>

          <div className={styles['legend']}>
            <CalendarIcon className={styles['legend-icon']} /> Places et tarifs
          </div>

          {formik.values.quantityPerPriceCategories.map(
            (quantityPerPriceCategory, index) => (
              <FormLayout.Row key={index} inline>
                <TextInput
                  label="Nombre de places"
                  name={`quantityPerPriceCategories[${index}].quantity`}
                  type="number"
                  step="1"
                />

                <Select
                  label="Tarif"
                  name={`quantityPerPriceCategories[${index}].priceCategory`}
                  options={priceCategoryOptions}
                  defaultOption={{
                    label: 'Sélectionner un tarif',
                    value: '',
                  }}
                />
              </FormLayout.Row>
            )
          )}

          <FormLayout.Row inline>
            <TextInput
              label="Date limite de réservation"
              name="bookingLimitDateInterval"
              type="number"
              step="1"
            />
            <div>jours avant le début de l’évènement</div>
          </FormLayout.Row>
        </FormLayout.Section>

        <div className={styles['action-buttons']}>
          <Button variant={ButtonVariant.SECONDARY} onClick={onCancel}>
            Annuler
          </Button>

          <SubmitButton
            Icon={CircleArrowIcon}
            iconPosition={IconPositionEnum.RIGHT}
          >
            Ajouter cette date
          </SubmitButton>
        </div>
      </form>
    </FormikProvider>
  )
}
