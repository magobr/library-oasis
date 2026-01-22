import { Expose } from 'class-transformer';

export class VerifyRoleRbacDto {
  @Expose()
  id: string;

  @Expose()
  type_id: string;

  @Expose()
  admin_id: string;
}