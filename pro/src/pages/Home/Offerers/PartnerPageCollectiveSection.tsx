import { DMSApplicationForEAC, DMSApplicationstatus } from 'apiClient/v1'
import useAnalytics from 'app/App/analytics/firebase'
import { Events } from 'core/FirebaseEvents/constants'
import fullInfoIcon from 'icons/full-info.svg'
import fullLinkIcon from 'icons/full-link.svg'
import fullNextIcon from 'icons/full-next.svg'
import { ButtonLink } from 'ui-kit/Button/ButtonLink'
import { ButtonVariant } from 'ui-kit/Button/types'
import { Tag, TagVariant } from 'ui-kit/Tag/Tag'
import { getLastCollectiveDmsApplication } from 'utils/getLastCollectiveDmsApplication'

import styles from './PartnerPage.module.scss'

export type PartnerPageCollectiveSectionProps = {
  collectiveDmsApplications: DMSApplicationForEAC[]
  venueId: number
  offererId: number
  venueName: string
  allowedOnAdage: boolean
  isDisplayedInHomepage?: boolean
}

export function PartnerPageCollectiveSection({
  venueId,
  offererId,
  venueName,
  allowedOnAdage,
  collectiveDmsApplications,
  isDisplayedInHomepage = false,
}: PartnerPageCollectiveSectionProps) {
  const { logEvent } = useAnalytics()

  const lastDmsApplication = getLastCollectiveDmsApplication(
    collectiveDmsApplications
  )

  const logCollectiveHelpLinkClick = () => {
    logEvent(Events.CLICKED_PARTNER_BLOCK_COLLECTIVE_HELP_LINK, {
      venueId: venueId,
    })
  }

  const logDMSApplicationLinkClick = () => {
    logEvent(Events.CLICKED_PARTNER_BLOCK_DMS_APPLICATION_LINK, {
      venueId: venueId,
    })
  }

  const header = isDisplayedInHomepage ? (
    <h4 className={styles['details-title']}>Enseignants</h4>
  ) : (
    <span className={styles['details-normal']}>
      État auprès des enseignants&nbsp;:
    </span>
  )

  if (allowedOnAdage) {
    return (
      <section className={styles['details']}>
        <div>
          {header}
          <Tag className={styles['tag']} variant={TagVariant.LIGHT_GREEN}>
            Référencé dans ADAGE
          </Tag>
        </div>
        {isDisplayedInHomepage && (
          <p className={styles['details-description']}>
            Les enseignants voient les offres vitrines et celles que vous
            adressez à leur établissement sur ADAGE. Complétez vos informations
            à destination des enseignants pour qu’ils vous contactent !
          </p>
        )}
        {isDisplayedInHomepage && (
          <ButtonLink
            variant={ButtonVariant.TERNARY}
            className={styles['details-link']}
            link={{
              to: `/structures/${offererId}/lieux/${venueId}/eac`,
              'aria-label': `Gérer la page pour les enseignants ${venueName}`,
            }}
            icon={fullNextIcon}
          >
            Gérer votre page pour les enseignants
          </ButtonLink>
        )}
      </section>
    )
  } else if (lastDmsApplication === null) {
    return (
      <section className={styles['details']}>
        <div>
          {header}
          <Tag className={styles['tag']} variant={TagVariant.LIGHT_BLUE}>
            Non référencé dans ADAGE
          </Tag>
        </div>

        <p className={styles['details-description']}>
          Pour pouvoir adresser des offres aux enseignants, vous devez être
          référencé dans ADAGE, l’application du ministère de l’Education
          nationale et de la Jeunesse dédiée à l’EAC.
        </p>

        {isDisplayedInHomepage && (
          <ButtonLink
            variant={ButtonVariant.TERNARY}
            className={styles['details-link']}
            link={{
              to: `/structures/${offererId}/lieux/${venueId}/eac`,
              'aria-label': `Gérer la page pour les enseignants ${venueName}`,
            }}
            icon={fullNextIcon}
          >
            Gérer votre page pour les enseignants
          </ButtonLink>
        )}
        <ButtonLink
          variant={ButtonVariant.TERNARY}
          icon={fullLinkIcon}
          link={{
            to: 'https://www.demarches-simplifiees.fr/commencer/demande-de-referencement-sur-adage',
            isExternal: true,
            target: '_blank',
          }}
          svgAlt="Nouvelle fenêtre"
          className={styles['details-link']}
          onClick={logDMSApplicationLinkClick}
        >
          Faire une demande de référencement ADAGE
        </ButtonLink>

        <ButtonLink
          variant={ButtonVariant.TERNARY}
          icon={fullInfoIcon}
          link={{
            to: 'https://aide.passculture.app/hc/fr/categories/4410482280977--Acteurs-Culturels-Tout-savoir-sur-le-pass-Culture-collectif-%C3%A0-destination-des-groupes-scolaires',
            isExternal: true,
            target: '_blank',
          }}
          svgAlt="Nouvelle fenêtre"
          className={styles['details-link']}
          onClick={logCollectiveHelpLinkClick}
        >
          En savoir plus sur le pass Culture à destination des scolaires
        </ButtonLink>
      </section>
    )
  } else if (
    lastDmsApplication.state === DMSApplicationstatus.REFUSE ||
    lastDmsApplication.state === DMSApplicationstatus.SANS_SUITE
  ) {
    return (
      <section className={styles['details']}>
        <div>
          {header}
          <Tag className={styles['tag']} variant={TagVariant.LIGHT_BLUE}>
            Non référencé dans ADAGE
          </Tag>
        </div>

        <p className={styles['details-description']}>
          Pour pouvoir adresser des offres aux enseignants, vous devez être
          référencé dans ADAGE, l’application du ministère de l’Education
          nationale et de la Jeunesse dédiée à l’EAC.
        </p>

        {isDisplayedInHomepage && (
          <ButtonLink
            variant={ButtonVariant.TERNARY}
            className={styles['details-link']}
            link={{
              to: `/structures/${offererId}/lieux/${venueId}/eac`,
              'aria-label': `Gérer la page pour les enseignants ${venueName}`,
            }}
            icon={fullNextIcon}
          >
            Gérer votre page pour les enseignants
          </ButtonLink>
        )}
      </section>
    )
  }
  // Last case :
  // (lastDmsApplication?.state === DMSApplicationstatus.ACCEPTE && !hasAdageId) ||
  // lastDmsApplication?.state === DMSApplicationstatus.EN_CONSTRUCTION ||
  // lastDmsApplication?.state === DMSApplicationstatus.EN_INSTRUCTION)
  return (
    <section className={styles['details']}>
      <div>
        {header}
        <Tag className={styles['tag']} variant={TagVariant.LIGHT_YELLOWN}>
          Référencement en cours
        </Tag>
      </div>

      <p className={styles['details-description']}>
        Votre démarche de référencement est en cours de traitement par ADAGE.
      </p>
      {isDisplayedInHomepage && (
        <ButtonLink
          variant={ButtonVariant.TERNARY}
          className={styles['details-link']}
          link={{
            to: `/structures/${offererId}/lieux/${venueId}/eac`,
            'aria-label': `Gérer la page pour les enseignants ${venueName}`,
          }}
          icon={fullNextIcon}
        >
          Gérer votre page pour les enseignants
        </ButtonLink>
      )}
      <ButtonLink
        variant={ButtonVariant.TERNARY}
        icon={fullInfoIcon}
        link={{
          to: 'https://aide.passculture.app/hc/fr/categories/4410482280977--Acteurs-Culturels-Tout-savoir-sur-le-pass-Culture-collectif-%C3%A0-destination-des-groupes-scolaires',
          isExternal: true,
          target: '_blank',
        }}
        svgAlt="Nouvelle fenêtre"
        className={styles['details-link']}
        onClick={logCollectiveHelpLinkClick}
      >
        En savoir plus sur le pass Culture à destination des scolaires
      </ButtonLink>
    </section>
  )
}
