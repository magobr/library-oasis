import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, {message: 'Invalid email format'})
  email: string;

  @IsString({message: 'Name must be a string'})
  @MaxLength(100, {message: 'Name must be at most 100 characters'})
  name: string;
}