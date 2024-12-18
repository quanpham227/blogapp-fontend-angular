import { User } from '../../models/user';

export interface UserListResponse {
  users: User[];
  totalPages: number;
}
