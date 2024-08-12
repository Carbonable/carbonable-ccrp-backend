import { IsString, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  previousPassword: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
