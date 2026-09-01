export type IdentityProfile = {
  userId: string;
  email: string;
  displayName: string | null;
  locale: string;
  timeZone: string;
  createdAt: Date;
};

export const PROFILE_SURFACE_PATH = "/profil" as const;
export const WALLET_SURFACE_PATH = "/cuzdan" as const;
export const PROFILE_WRITE_PATH = "/api/profile" as const;
export const PROFILE_BILLING_PATH = "/api/profile/billing" as const;
export const DISPLAY_NAME_MAX_LENGTH = 80;
