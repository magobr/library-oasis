import { Expose } from 'class-transformer';

export class ResponseUpdateRoleRbacDto {
  @Expose()
  message: string;

  @Expose()
  roles: string;
}