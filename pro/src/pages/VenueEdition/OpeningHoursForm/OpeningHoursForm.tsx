import { useFormikContext } from 'formik'

import { mapDayToFrench } from 'pages/VenueEdition/OpeningHoursReadOnly/utils'
import { DayCheckbox } from 'screens/IndividualOffer/StocksEventCreation/DayCheckbox'
import { TimePicker } from 'ui-kit'

import { VenueEditionFormValues } from '../types'

import styles from './OpeningHoursForm.module.scss'

const daysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export function OpeningHoursForm() {
  const {
    values: { days },
  } = useFormikContext<VenueEditionFormValues>()

  return (
    <>
      <fieldset className={styles['day-inputs']}>
        <legend className={styles['legend-days']}>
          Sélectionner vos jours d’ouverture :
        </legend>
        {daysOfWeek.map((engDay) => {
          const frDay = mapDayToFrench(engDay)
          return (
            <DayCheckbox
              letter={frDay[0]}
              label={frDay}
              name="days"
              value={engDay.toLowerCase()}
              className={styles['day-checkbox']}
              key={engDay}
            />
          )
        })}
      </fieldset>
      {days.length > 0 && (
        <ul>
          {days
            .sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b))
            .map((day) => (
              <li key={day}>
                <fieldset className={styles['inputs-line']}>
                  <div className={styles['legend-wrapper']}>
                    <legend className={styles['legend-hours']}>
                      {mapDayToFrench(day)}
                    </legend>
                  </div>
                  <HourLine />
                </fieldset>
              </li>
            ))}
        </ul>
      )}
    </>
  )
}

function HourLine() {
  return (
    <span className={styles['hour-line']}>
      <TimePicker
        label={'Horaire d’ouverture 1'}
        name={`1`}
        isLabelHidden
        hideFooter
        inline
        className={styles['time-picker']}
      />
      -
      <TimePicker
        label={'Horaire de fermeture 1'}
        name={`2`}
        isLabelHidden
        hideFooter
        inline
        className={styles['time-picker']}
      />
      |
      <TimePicker
        label={'Horaire d’ouverture 2'}
        name={`3`}
        isLabelHidden
        hideFooter
        inline
        className={styles['time-picker']}
      />
      -
      <TimePicker
        label={'Horaire de fermeture 2'}
        name={`4`}
        isLabelHidden
        hideFooter
        inline
        className={styles['time-picker']}
      />
    </span>
  )
}
