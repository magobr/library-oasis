import { Expose } from 'class-transformer';

export class ResponseRoleRbacDto {
  @Expose()
  message: string;

  @Expose()
  role_type: string;

  @Expose()
  roles: string;
}