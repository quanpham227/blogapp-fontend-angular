import { Role } from '../../models/role';

export interface UserResponse {
  id: number;
  fullname: string;
  email: string;
  phone_number: string;
  profile_image: string;
  is_active: boolean;
  facebook_account_id: string;
  google_account_id: string;
  role: Role;
}
