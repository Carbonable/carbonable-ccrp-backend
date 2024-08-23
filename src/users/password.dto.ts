import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'The username of the user' })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({ description: 'The previous password of the user' })
  @IsString()
  @IsNotEmpty()
  previousPassword: string;

  @ApiProperty({ description: 'The new password of the user' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
