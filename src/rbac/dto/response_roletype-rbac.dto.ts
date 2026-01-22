import { Expose } from 'class-transformer';

export class ResponseRoleTypeRbacDto {
  @Expose()
  id: string;

  @Expose()
  type: string;

  @Expose()
  create: boolean;

  @Expose()
  read: boolean;

  @Expose()
  update: boolean;

  @Expose()
  delete: boolean;
}