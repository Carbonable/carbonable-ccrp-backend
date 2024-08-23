import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthDto {
  @ApiProperty({ description: 'The username of the user' })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The password of the user',
  })
  @IsString()
  password: string;
}
