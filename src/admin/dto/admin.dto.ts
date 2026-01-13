import { Exclude, Expose } from 'class-transformer';

export class AdminDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  createdAt: Date | null;
}
