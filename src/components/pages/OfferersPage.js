import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import { connect } from 'react-redux'
import { compose } from 'redux'
import get from 'lodash.get'

import withLogin from '../hocs/withLogin'
import PageWrapper from '../layout/PageWrapper'
import OfferersList from '../OfferersList'
import SearchInput from '../layout/SearchInput'

class OfferersPage extends Component {
  render() {
    const {
      offerers
    } = this.props
    return (
      <PageWrapper name="profile" loading={!offerers}>
        <h1 className="title has-text-centered">Vos établissements</h1>
        <nav className="level is-mobile">
          <NavLink to={`/etablissements/nouveau`}>
            <button className="button is-primary level-item">
              Nouvel établissement
            </button>
          </NavLink>
        </nav>
        <nav className="level is-mobile">
          <SearchInput collectionNames={["events", "things"]} isLoading />
        </nav>
        <OfferersList />
      </PageWrapper>
    )
  }
}

export default compose(
  withLogin({ isRequired: true }),
  connect(
    state => ({
      user: state.user,
      offerers: get(state, 'user.offerers')
    })
  )
)(OfferersPage)
