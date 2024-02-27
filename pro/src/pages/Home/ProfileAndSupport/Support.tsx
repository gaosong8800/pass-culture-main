import React from 'react'
import { useLocation } from 'react-router-dom'

import { Events } from 'core/FirebaseEvents/constants'
import useActiveFeature from 'hooks/useActiveFeature'
import useAnalytics from 'hooks/useAnalytics'
import fullLinkIcon from 'icons/full-link.svg'
import fullMailIcon from 'icons/full-mail.svg'
import fullParametersIcon from 'icons/full-parameters.svg'
import { Button, ButtonLink } from 'ui-kit'
import { ButtonVariant } from 'ui-kit/Button/types'
import { initCookieConsent } from 'utils/cookieConsentModal'

import { Card } from '../Card'

import styles from './Support.module.scss'

export const Support: () => JSX.Element | null = () => {
  const { logEvent } = useAnalytics()
  const location = useLocation()
  const isNewSideBarNavigation = useActiveFeature('WIP_ENABLE_PRO_SIDE_NAV')

  return (
    <Card>
      <h3 className={styles['title']}>Aide et support</h3>

      <div className={styles['card-content']}>
        <ul>
          <li>
            <ButtonLink
              link={{
                to: 'https://aide.passculture.app',
                isExternal: true,
                target: '_blank',
              }}
              icon={fullLinkIcon}
              onClick={() =>
                logEvent?.(Events.CLICKED_HELP_CENTER, {
                  from: location.pathname,
                })
              }
              svgAlt="Nouvelle fenêtre"
            >
              Centre d’aide
            </ButtonLink>
          </li>

          <li>
            <ButtonLink
              link={{
                to: 'https://passcultureapp.notion.site/pass-Culture-Documentation-323b1a0ec309406192d772e7d803fbd0',
                isExternal: true,
                target: '_blank',
              }}
              icon={fullLinkIcon}
              onClick={() =>
                logEvent?.(Events.CLICKED_BEST_PRACTICES_STUDIES, {
                  from: location.pathname,
                })
              }
              svgAlt="Nouvelle fenêtre"
            >
              Bonnes pratiques et études
            </ButtonLink>
          </li>

          <li>
            <ButtonLink
              link={{
                to: 'mailto:support-pro@passculture.app',
                isExternal: true,
                target: '_blank',
              }}
              icon={fullMailIcon}
              onClick={() =>
                logEvent?.(Events.CLICKED_CONSULT_SUPPORT, {
                  from: location.pathname,
                })
              }
            >
              Contacter le support par mail à <br />
              support-pro@passculture.app
            </ButtonLink>
          </li>
          {!isNewSideBarNavigation && (
            <>
              <li>
                <ButtonLink
                  link={{
                    to: 'https://pass.culture.fr/cgu-professionnels/',
                    isExternal: true,
                    target: '_blank',
                  }}
                  icon={fullLinkIcon}
                  onClick={() =>
                    logEvent?.(Events.CLICKED_CONSULT_CGU, {
                      from: location.pathname,
                    })
                  }
                  svgAlt="Nouvelle fenêtre"
                >
                  Conditions Générales d’Utilisation
                </ButtonLink>
              </li>
              <li>
                <Button
                  variant={ButtonVariant.TERNARY}
                  icon={fullParametersIcon}
                  onClick={() => {
                    /* istanbul ignore next : library should be tested */
                    initCookieConsent().show()
                  }}
                >
                  Gestion des cookies
                </Button>
              </li>
            </>
          )}
        </ul>
      </div>
    </Card>
  )
}
