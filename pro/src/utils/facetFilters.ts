import { VenueResponse } from 'apiClient/adage'
import useActiveFeature from 'hooks/useActiveFeature'

export const getDefaultFacetFilterUAICodeValue = (
  uai?: string | null,
  departmentCode?: string | null,
  venueFilter?: VenueResponse | null
) => {
  const newAdageFilters = useActiveFeature('WIP_ENABLE_NEW_ADAGE_FILTERS')
  const institutionIdFilters = ['offer.educationalInstitutionUAICode:all']

  if (uai) {
    institutionIdFilters.push(`offer.educationalInstitutionUAICode:${uai}`)
  }

  return departmentCode && !venueFilter && !newAdageFilters
    ? [[`venue.departmentCode:${departmentCode}`], institutionIdFilters]
    : [institutionIdFilters]
}
