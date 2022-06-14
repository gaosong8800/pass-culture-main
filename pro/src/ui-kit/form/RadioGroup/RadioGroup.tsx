import { FieldSetLayout } from '../shared'
import { RadioButton } from '..'
import React from 'react'
import cn from 'classnames'
import styles from './RadioGroup.module.scss'
import { useField } from 'formik'

export enum Direction {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
}
export interface IRadioGroupProps {
  direction?: Direction.HORIZONTAL | Direction.VERTICAL
  name: string
  legend?: string
  group: {
    label: string
    value: string
  }[]
  className?: string
  withBorder?: boolean
}

const RadioGroup = ({
  direction = Direction.VERTICAL,
  group,
  name,
  legend,
  className,
  withBorder,
}: IRadioGroupProps): JSX.Element => {
  const [, meta] = useField({ name })

  return (
    <FieldSetLayout
      className={cn(
        styles['radio-group'],
        styles[`radio-group-${direction}`],
        className
      )}
      dataTestId={`wrapper-${name}`}
      error={meta.touched && !!meta.error ? meta.error : undefined}
      hideFooter
      legend={legend}
      name={`radio-group-${name}`}
    >
      {group.map(item => (
        <div className={styles['radio-group-item']} key={item.label}>
          <RadioButton
            label={item.label}
            name={name}
            value={item.value}
            withBorder={withBorder}
          />
        </div>
      ))}
    </FieldSetLayout>
  )
}

export default RadioGroup
