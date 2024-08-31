import { Role } from '../../models/role';

export interface LoginResponse {
  message: string;
  status: string;
  data: {
    tokenType: string | null;
    id: number;
    username: string;
    roles: Role;
    message: string;
    token: string;
    refresh_token: string | null;
  };
}
