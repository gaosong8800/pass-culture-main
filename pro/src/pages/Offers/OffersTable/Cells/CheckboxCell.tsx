import { BaseCheckbox } from 'ui-kit/form/shared/BaseCheckbox/BaseCheckbox'

import styles from '../OfferRow.module.scss'

interface CheckboxCellProps {
  offerName: string
  isSelected: boolean
  disabled?: boolean
  selectOffer: () => void
  headers?: string
}

export const CheckboxCell = ({
  offerName,
  isSelected,
  disabled,
  selectOffer,
  headers,
}: CheckboxCellProps) => {
  return (
    <td className={styles['checkbox-column']} headers={headers}>
      <BaseCheckbox
        checked={isSelected}
        className="select-offer-checkbox"
        label={offerName}
        exceptionnallyHideLabelDespiteA11y={true}
        disabled={disabled}
        onChange={selectOffer}
      />
    </td>
  )
}
