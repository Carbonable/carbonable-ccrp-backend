import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../roles/role.enum';

export class User {
  @ApiProperty({ example: '1', description: 'The ID of the user' })
  id: string;

  @ApiProperty({ example: 'john', description: 'The username of the user' })
  name: string;

  @ApiProperty({ example: 'password', description: 'The password of the user' })
  password: string;

  @ApiProperty({ example: [Role.User], description: 'The roles of the user' })
  roles: Role[];
}
