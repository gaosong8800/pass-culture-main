import classNames from 'classnames'

import { useActiveFeature } from 'commons/hooks/useActiveFeature'

import styles from './IndividualOffersTableHead.module.scss'

export const IndividualOffersTableHead = (): JSX.Element => {
  const offerAddressEnabled = useActiveFeature('WIP_ENABLE_OFFER_ADDRESS')
  return (
    <thead role="rowgroup" className={styles['individual-offers-thead']}>
      <tr>
        <th colSpan={3} />
        <th role="columnheader" className={styles['individual-th']}>
          {offerAddressEnabled ? 'Localisation' : 'Lieu'}
        </th>
        <th role="columnheader" className={styles['individual-th']}>Stocks</th>
        <th role="columnheader" className={styles['individual-th']}>Statut</th>
        <th
          role="columnheader"
          className={classNames(
            styles['individual-th'],
            styles['individualth-actions']
          )}
        >
          Actions
        </th>
      </tr>
    </thead>
  )
}
