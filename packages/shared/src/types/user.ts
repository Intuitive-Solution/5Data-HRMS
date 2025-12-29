/**
 * User & Profile Types
 */

import type { UserRole } from './auth.js';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  roles: UserRole[];
  profile_picture_url?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}



