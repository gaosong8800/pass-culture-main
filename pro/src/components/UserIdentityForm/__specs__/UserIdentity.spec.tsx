import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { api } from 'apiClient/api'
import { sharedCurrentUserFactory } from 'commons/utils/factories/storeFactories'
import { renderWithProviders } from 'commons/utils/renderWithProviders'

import { UserIdentityForm, UserIdentityFormProps } from '../UserIdentityForm'

const renderUserIdentityForm = (props: UserIdentityFormProps) => {
  return renderWithProviders(<UserIdentityForm {...props} />, {
    user: sharedCurrentUserFactory(),
  })
}

describe('components:UserIdentityForm', () => {
  let props: UserIdentityFormProps
  beforeEach(() => {
    props = {
      closeForm: vi.fn(),
      initialValues: {
        firstName: 'FirstName',
        lastName: 'lastName',
      },
    }
    vi.spyOn(api, 'patchUserIdentity').mockResolvedValue({
      firstName: 'Jean',
      lastName: 'Dupont',
    })
  })
  it('renders component successfully', () => {
    renderUserIdentityForm(props)
    expect(screen.getAllByRole('textbox').length).toBe(2)
  })
  it('should trigger onSubmit callback when submitting', async () => {
    renderUserIdentityForm(props)

    await userEvent.type(screen.getByLabelText('Prénom *'), 'Harry')
    await userEvent.tab()
    await userEvent.click(screen.getByText('Enregistrer'))
    expect(api.patchUserIdentity).toHaveBeenCalledTimes(1)
  })
})
