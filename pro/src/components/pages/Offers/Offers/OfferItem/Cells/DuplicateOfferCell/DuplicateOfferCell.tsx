import React, { useState } from 'react'

import { ReactComponent as PlusIcon } from 'icons/ico-plus.svg'
import { Button } from 'ui-kit'
import { ButtonVariant } from 'ui-kit/Button/types'
import TooltipWrapper from 'ui-kit/TooltipWrapper'

import styles from '../../OfferItem.module.scss'

import DuplicateOfferDialog from './DuplicateOfferDialog'

const LOCAL_STORAGE_HAS_SEEN_MODAL_KEY = 'DUPLICATE_OFFER_MODAL_SEEN'

const DuplicateOfferCell = ({ isTemplate }: { isTemplate: boolean }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const shouldDisplayModal =
    localStorage.getItem(LOCAL_STORAGE_HAS_SEEN_MODAL_KEY) !== 'true'

  const onDialogConfirm = (shouldNotDisplayModalAgain: boolean) => {
    if (shouldNotDisplayModalAgain) {
      localStorage.setItem(LOCAL_STORAGE_HAS_SEEN_MODAL_KEY, 'true')
    }
    setIsModalOpen(false)
  }

  return (
    <>
      <td className={styles['duplicate-offer-column']}>
        {isTemplate ? (
          <TooltipWrapper
            delay={0}
            title="Créer une offre réservable pour un établissement"
          >
            <Button
              variant={ButtonVariant.SECONDARY}
              className={styles['button']}
              onClick={() => setIsModalOpen(true)}
            >
              <PlusIcon
                className={styles['button-icon']}
                title="Créer une offre réservable pour un établissement"
              />
            </Button>
          </TooltipWrapper>
        ) : null}
      </td>
      {isModalOpen && shouldDisplayModal && (
        <DuplicateOfferDialog
          onCancel={() => setIsModalOpen(false)}
          onConfirm={onDialogConfirm}
        />
      )}
    </>
  )
}
export default DuplicateOfferCell
