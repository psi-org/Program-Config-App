export interface UserCredentials {
  username?: string;
  disabled?: boolean;
  selfRegistered?: boolean;
  invitation?: boolean;
  twoFA?: boolean;
  catDimensionConstraints?: boolean;
  cogsDimensionConstraints?: boolean;
  sharingConstraint?: boolean;
}
