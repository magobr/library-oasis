import { Expose } from 'class-transformer';

export class AuthAdminDto {
  @Expose()
  access_token: string;
}