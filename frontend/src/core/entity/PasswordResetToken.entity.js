import { BaseEntity } from './BaseEntity.entity';
import { User } from './User.entity';

export class PasswordResetToken extends BaseEntity {
  user!: User;
  tokenHash!: string;
  expiresAt!: Date;
  used!: boolean;
  usedAt?: Date | null;
  
  isExpired(now: Date): boolean {
    return this.expiresAt < now;
  }

  isActive(now: Date): boolean {
    return !this.used && !this.isExpired(now);
  }
}
