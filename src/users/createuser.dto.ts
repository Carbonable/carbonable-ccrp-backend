import { IsString, MinLength } from 'class-validator';

export class UserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}
