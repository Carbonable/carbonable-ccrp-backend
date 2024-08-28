import { Role } from '../roles/role.enum';

export class UserEntity {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
  orgId?: string; // Optional field
  role: Role;
}
