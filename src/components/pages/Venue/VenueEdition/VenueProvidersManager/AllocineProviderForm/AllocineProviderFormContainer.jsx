import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { compose } from 'redux'

import * as pcApi from 'repository/pcapi/pcapi'
import { showNotificationV1 } from 'store/reducers/notificationReducer'

import { getRequestErrorStringFromErrors } from '../utils/getRequestErrorStringFromErrors'

import AllocineProviderForm from './AllocineProviderForm'

export const mapDispatchToProps = dispatch => ({
  createVenueProvider: payload =>
    pcApi.createVenueProvider(payload).then(venueProvider => {
      dispatch({
        type: 'SET_VENUE_PROVIDERS',
        payload: [venueProvider],
      })

      return venueProvider
    }),
  notify: errors => {
    dispatch(
      showNotificationV1({
        text: getRequestErrorStringFromErrors(errors),
        type: 'danger',
      })
    )
  },
})

export default compose(withRouter, connect(null, mapDispatchToProps))(AllocineProviderForm)
