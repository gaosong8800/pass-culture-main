/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GenderEnum } from './GenderEnum';
import type { NavStateResponseModel } from './NavStateResponseModel';
import type { UserRole } from './UserRole';
export type SharedLoginUserResponseModel = {
  activity?: string | null;
  address?: string | null;
  city?: string | null;
  civility?: GenderEnum | null;
  dateCreated: string;
  dateOfBirth?: string | null;
  departementCode?: string | null;
  email: string;
  firstName?: string | null;
  hasSeenProRgs?: boolean | null;
  hasSeenProTutorials?: boolean | null;
  hasUserOfferer?: boolean | null;
  id: number;
  isAdmin: boolean;
  isEmailValidated: boolean;
  lastConnectionDate?: string | null;
  lastName?: string | null;
  navState?: NavStateResponseModel | null;
  needsToFillCulturalSurvey?: boolean | null;
  phoneNumber?: string | null;
  postalCode?: string | null;
  roles: Array<UserRole>;
};

