import { AppLayout } from 'app/AppLayout'
import fullBackIcon from 'icons/full-back.svg'
import { ButtonLink } from 'ui-kit/Button/ButtonLink'

import styles from './MultiyearScheme.module.scss'

export const MultiyearScheme = () => {
  return (
    <AppLayout>
      <ButtonLink
        link={{
          to: '/accessibilite/',
        }}
        icon={fullBackIcon}
      >
        Retour vers la page Informations d’accessibilité
      </ButtonLink>
      <h1 className={styles['title-accessibility']}>Schéma pluriannuel</h1>
    </AppLayout>
  )
}
// Lazy-loaded by react-router-dom
// ts-unused-exports:disable-next-line
export const Component = MultiyearScheme
