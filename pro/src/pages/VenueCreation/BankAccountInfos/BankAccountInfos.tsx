import React from 'react'

import { BankAccountResponseModel } from 'apiClient/v1'
import { useActiveFeature } from 'commons/hooks/useActiveFeature'
import { Callout } from 'components/Callout/Callout'
import { CalloutVariant } from 'components/Callout/types'
import { FormLayout } from 'components/FormLayout/FormLayout'
import { TextInput } from 'ui-kit/form/TextInput/TextInput'

interface BankAccountInfosProps {
  venueBankAccount?: BankAccountResponseModel | null
}

export const BankAccountInfos = ({
  venueBankAccount,
}: BankAccountInfosProps) => {
  const isOfferAddressEnabled = useActiveFeature('WIP_ENABLE_OFFER_ADDRESS')

  return (
    <FormLayout.Section title="Compte bancaire">
      {venueBankAccount && (
        <TextInput
          label="Compte bancaire"
          name="bankAccount"
          value={`${venueBankAccount.label} - ${venueBankAccount.obfuscatedIban}`}
          disabled
          isOptional
        />
      )}

      <Callout
        variant={CalloutVariant.INFO}
        links={[
          {
            label: 'Gérer les remboursements',
            href: '/remboursements/informations-bancaires',
          },
        ]}
      >
        {venueBankAccount
          ? `Vous souhaitez modifier le compte bancaire rattaché à ${isOfferAddressEnabled ? 'cette structure' : 'ce lieu'} ?`
          : `Aucun compte bancaire n’est rattaché à ${isOfferAddressEnabled ? 'cette structure' : 'ce lieu'}.`}
      </Callout>
    </FormLayout.Section>
  )
}
