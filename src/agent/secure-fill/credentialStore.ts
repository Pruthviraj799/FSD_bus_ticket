export interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  passwordPlaceholder: string;
}

export class CredentialStore {
  private static DEFAULT_PROFILE: UserProfileData = {
    name: 'Alex Mercer',
    email: 'alex.mercer@univ.edu',
    phone: '+1 (555) 234-5678',
    dob: '2001-09-15',
    address: '42 Tech Innovation Way, San Francisco, CA',
    passwordPlaceholder: 'SecurePass#2026!'
  };

  public static getSecureProfile(): UserProfileData {
    return CredentialStore.DEFAULT_PROFILE;
  }

  /**
   * Resolves field key to value locally inside browser context.
   * Credentials NEVER pass through the AI reasoning context raw.
   */
  public static getFieldValue(fieldTypeOrName: string): string {
    const key = fieldTypeOrName.toLowerCase();
    const profile = CredentialStore.getSecureProfile();

    if (key.includes('name')) return profile.name;
    if (key.includes('email')) return profile.email;
    if (key.includes('phone') || key.includes('mobile')) return profile.phone;
    if (key.includes('dob') || key.includes('birth') || key.includes('date')) return profile.dob;
    if (key.includes('address')) return profile.address;
    if (key.includes('pass') || key.includes('secret')) return profile.passwordPlaceholder;

    return 'Default Local Value';
  }
}
