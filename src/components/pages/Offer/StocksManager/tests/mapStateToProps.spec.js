<<<<<<< HEAD:src/components/pages/Offer/StocksManager/tests/mapStateToProps.spec.js
import mapStateToProps from '../mapStateToProps'

describe('src | components | pages | Offer | StocksManagerContainer | mapStateToProps', () => {
=======
import { mapStateToProps } from '../StocksManagerContainer'

describe('src | components | pages | Offer | StocksManagerContainer | StocksManagerContainer ', () => {
>>>>>>> (pC-1875) prepared test:src/components/pages/Offer/StocksManager/tests/StocksManagerContainer.spec.jsx
  let state
  let props

  beforeEach(() => {
    state = {
      data: {
        offers: [{ id: 'A1', isEvent: true, isThing: false, productId: 'B1' }],
        providers: [],
        products: [{ id: 'B1', lastProviderId: 'C1' }],
        stocks: [{ offerId: 'A1' }],
      },
    }
    props = {
      match: {},
    }
  })

  describe('mapStateToProps', () => {
    it('should return an empty object when offer was not found', () => {
      // given
      props.match.params = {
        offerId: 'A2',
      }

      // when
      const result = mapStateToProps(state, props)

      // then
      expect(result).toEqual({})
    })

    it('should return an object when offer was found', () => {
      // given
      props.match.params = {
        offerId: 'A1',
      }

      // when
      const result = mapStateToProps(state, props)

      // then
      expect(result).toEqual({
        isEvent: true,
        offer: {
          id: 'A1',
          isEvent: true,
          isThing: false,
          productId: 'B1',
        },
        product: {
          id: 'B1',
          lastProviderId: 'C1',
        },
        shouldPreventCreationOfSecondStock: false,
        stocks: [
          {
            offerId: 'A1',
          },
        ],
      })
    })

    describe('shouldPreventCreationOfSecondStock', () => {
      it('should be false when offer is an event', () => {
        // given
        state.data.offers[0].isEvent = true
        state.data.offers[0].isThing = false
        props.match.params = {
          offerId: 'A1',
        }

        // when
        const result = mapStateToProps(state, props)

        // then
        expect(result).toHaveProperty(
          'shouldPreventCreationOfSecondStock',
          false
        )
      })

      it('should be false when stocks are equal to zero', () => {
        // given
        state.data.offers[0].isEvent = true
        state.data.offers[0].isThing = false
        state.data.stocks = []
        props.match.params = {
          offerId: 'A1',
        }

        // when
        const result = mapStateToProps(state, props)

        // then
        expect(result).toHaveProperty(
          'shouldPreventCreationOfSecondStock',
          false
        )
      })

      it('should be true when offer is a thing and stocks is superior to zero', () => {
        // given
        state.data.offers[0].isEvent = false
        state.data.offers[0].isThing = true
        props.match.params = {
          offerId: 'A1',
        }

        // when
        const result = mapStateToProps(state, props)

        // then
        expect(result).toHaveProperty(
          'shouldPreventCreationOfSecondStock',
          true
        )
      })
    })
  })
})
