import { screen } from '@testing-library/react'

import { sharedCurrentUserFactory } from 'commons/utils/factories/storeFactories'
import { renderWithProviders } from 'commons/utils/renderWithProviders'

import { OldLayout } from '../OldLayout'

const renderOldLayout = (isImpersonated = false) => {
  renderWithProviders(<OldLayout />, {
    user: sharedCurrentUserFactory({
      isImpersonated,
    }),
  })
}

describe('App', () => {
  it('should render connect as banner if user has isImpersonated value is true', () => {
    renderOldLayout(true)

    expect(
      screen.getByText('Vous êtes connecté en tant que :')
    ).toBeInTheDocument()
  })
})
