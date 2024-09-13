import { Formik } from 'formik'
import { useState } from 'react'

import { api } from 'apiClient/api'
import { AppLayout } from 'app/AppLayout'
import { RECAPTCHA_ERROR, RECAPTCHA_ERROR_MESSAGE } from 'core/shared/constants'
import { useInitReCaptcha } from 'hooks/useInitReCaptcha'
import { useNotification } from 'hooks/useNotification'
import { useRedirectLoggedUser } from 'hooks/useRedirectLoggedUser'
import logoPassCultureProFullIcon from 'icons/logo-pass-culture-pro-full.svg'
import logoStyles from 'styles/components/layout/_Logo.module.scss'
import { Hero } from 'ui-kit/Hero/Hero'
import { SvgIcon } from 'ui-kit/SvgIcon/SvgIcon'
import { getReCaptchaToken } from 'utils/recaptcha'

import { ChangePasswordRequestForm } from './ChangePasswordRequestForm/ChangePasswordRequestForm'
import styles from './LostPassword.module.scss'
import { validationSchema } from './validationSchema'

type FormValues = { email: string }

export const LostPassword = (): JSX.Element => {
  const [mailSent, setMailSent] = useState(false)

  useRedirectLoggedUser()
  useInitReCaptcha()

  const notification = useNotification()

  const submitChangePasswordRequest = async (formValues: FormValues) => {
    try {
      const token = await getReCaptchaToken('resetPassword')
      await api.resetPassword({ token, email: formValues.email })
      setMailSent(true)
    } catch (e) {
      if (e === RECAPTCHA_ERROR) {
        notification.error(RECAPTCHA_ERROR_MESSAGE)
      }
      notification.error('Une erreur est survenue')
    }
  }

  return (
    <AppLayout layout="without-nav">
      <header className={styles['logo-side']}>
        <SvgIcon
          className={logoStyles['logo-unlogged']}
          viewBox="0 0 282 120"
          alt="Pass Culture pro, l’espace des acteurs culturels"
          src={logoPassCultureProFullIcon}
          width="135"
        />
      </header>
      <div className={styles['content']}>
        {mailSent ? (
          <Hero
            linkLabel="Retourner sur la page de connexion"
            linkTo="/"
            text="Vous allez recevoir par email les instructions pour définir un nouveau mot de passe."
            title="Merci !"
          />
        ) : (
          <Formik
            initialValues={{ email: '' }}
            onSubmit={submitChangePasswordRequest}
            validationSchema={validationSchema}
          >
            <ChangePasswordRequestForm />
          </Formik>
        )}
      </div>
    </AppLayout>
  )
}

// Lazy-loaded by react-router-dom
// ts-unused-exports:disable-next-line
export const Component = LostPassword
