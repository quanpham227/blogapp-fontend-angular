import { Role } from '../../models/role';

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage: string;
  isActive: boolean;
  facebookAccountId: string;
  googleAccountId: string;
  role: Role;
}
