import cn from 'classnames'

import style from '../BoxFormLayout.module.scss'

interface BoxFormLayoutFields {
  className?: string
  children?: React.ReactNode | React.ReactNode[]
}

export const Fields = ({
  className,
  children,
}: BoxFormLayoutFields): JSX.Element => (
  <div className={cn(style['box-form-layout-fields'], className)}>
    {children}
  </div>
)
