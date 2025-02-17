import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import * as useAnalytics from 'app/App/analytics/firebase'
import { BankAccountEvents } from 'commons/core/FirebaseEvents/constants'
import { defaultGetOffererResponseModel } from 'commons/utils/factories/individualApiFactories'
import { renderWithProviders } from 'commons/utils/renderWithProviders'

import {
  BankAccountHasPendingCorrectionCalloutProps,
  BankAccountHasPendingCorrectionCallout,
} from './BankAccountHasPendingCorrectionCallout'

const mockLogEvent = vi.fn()

describe('LinkVenueCallout', () => {
  const props: BankAccountHasPendingCorrectionCalloutProps = {
    titleOnly: false,
  }
  it('should not render LinkVenueCallout without FF', () => {
    renderWithProviders(<BankAccountHasPendingCorrectionCallout {...props} />)

    expect(
      screen.queryByText(/Compte bancaire incomplet/)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', {
        name: 'Voir les corrections attendues',
      })
    ).not.toBeInTheDocument()
  })

  describe('With FF enabled', () => {
    it('should not render the add link venue banner if the offerer has no bank account with pending corrections', () => {
      props.offerer = {
        ...defaultGetOffererResponseModel,
        hasBankAccountWithPendingCorrections: false,
      }
      renderWithProviders(<BankAccountHasPendingCorrectionCallout {...props} />)

      expect(
        screen.queryByText(/Compte bancaire incomplet/)
      ).not.toBeInTheDocument()
    })

    it('should render LinkVenueCallout', () => {
      props.offerer = {
        ...defaultGetOffererResponseModel,
        hasBankAccountWithPendingCorrections: true,
      }
      renderWithProviders(<BankAccountHasPendingCorrectionCallout {...props} />)

      expect(screen.getByText(/Compte bancaire incomplet/)).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: 'Voir les corrections attendues',
        })
      ).toBeInTheDocument()
    })

    it('should log add venue bank to account', async () => {
      vi.spyOn(useAnalytics, 'useAnalytics').mockImplementation(() => ({
        logEvent: mockLogEvent,
      }))

      props.offerer = {
        ...defaultGetOffererResponseModel,
        hasBankAccountWithPendingCorrections: true,
      }

      renderWithProviders(
        <BankAccountHasPendingCorrectionCallout {...props} />,
        {
          initialRouterEntries: ['/accueil'],
        }
      )

      await userEvent.click(
        screen.getByRole('link', {
          name: 'Voir les corrections attendues',
        })
      )

      expect(mockLogEvent).toHaveBeenCalledWith(
        BankAccountEvents.CLICKED__BANK_ACCOUNT_HAS_PENDING_CORRECTIONS,
        {
          from: '/accueil',
          offererId: 1,
        }
      )
    })
  })
})
