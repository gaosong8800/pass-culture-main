import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'
import React from 'react'

import { renderWithProviders } from 'utils/renderWithProviders'

import { SearchFormValues } from '../../../OffersSearch'
import { NoResultsPage } from '../NoResultsPage'

const handleSubmit = vi.fn()
const handleReset = vi.fn()

const renderNoResultsPage = ({
  initialValues,
}: {
  initialValues: SearchFormValues
}) => {
  return renderWithProviders(
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <NoResultsPage />
    </Formik>
  )
}

const initialValues = {
  query: '',
  domains: [],
  students: [],
  eventAddressType: '',
}

describe('ContactButton', () => {
  it('should clear all filters on click button ', async () => {
    renderNoResultsPage({
      initialValues: {
        ...initialValues,
        query: 'test',
        domains: [{ value: 'test', label: 'test' }],
      },
    })

    expect(screen.getByText('Aucun résultat trouvé pour cette recherche.'))

    const clearFilterButton = screen.getByRole('button', {
      name: 'Réinitialiser les filtres',
    })
    await userEvent.click(clearFilterButton)

    expect(handleReset).toHaveBeenCalled()
  })

  it('should not display clear all filters button ', async () => {
    renderNoResultsPage({
      initialValues: {
        ...initialValues,
        query: '',
      },
    })

    expect(screen.getByText('Aucun résultat trouvé pour cette recherche.'))

    const clearFilterButton = screen.queryByRole('button', {
      name: 'Réinitiliaser les filtres',
    })

    expect(clearFilterButton).not.toBeInTheDocument()
  })
})
