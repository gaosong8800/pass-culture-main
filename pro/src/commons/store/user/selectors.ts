import { RootState } from 'commons/store/rootReducer'

export const selectCurrentUser = (state: RootState) => state.user.currentUser

export const selectCurrentOffererId = (state: RootState) =>
  state.user.selectedOffererId
