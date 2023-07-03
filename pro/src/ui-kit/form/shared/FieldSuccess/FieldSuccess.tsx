import cn from 'classnames'
import React from 'react'

import strokeValidIcon from 'icons/stroke-valid.svg'
import { SvgIcon } from 'ui-kit/SvgIcon/SvgIcon'

import styles from './FieldSuccess.module.scss'

interface FieldSuccessProps {
  children: React.ReactNode | React.ReactNode[]
  className?: string
  name: string
  iconAlt?: string
}

const FieldSuccess = ({
  children,
  className,
  name,
  iconAlt = '',
}: FieldSuccessProps): JSX.Element => (
  <div className={cn(styles['field-success'], className)} id={name}>
    <SvgIcon src={strokeValidIcon} alt={iconAlt} width="16" />
    <span
      className={styles['field-success-text']}
      data-testid={`success-${name}`}
      role="alert"
    >
      {children}
    </span>
  </div>
)

export default FieldSuccess
