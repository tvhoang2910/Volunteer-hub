import { BaseEntity } from './BaseEntity.entity';
import { User } from './User.entity';
import { Event } from './Event.entity';

export type RegistrationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'CHECKED_IN'
  | 'COMPLETED';

export class Registration extends BaseEntity {
  volunteer!: User;
  event!: Event;
  registrationStatus!: RegistrationStatus;
  checkedInAt?: Date | null;
  completedAt?: Date | null;
  completedByUserId?: string | null;
  completionNotes?: string | null;
  approvedBy?: User | null;
  isCompleted?: boolean;
  withdrawnAt?: Date | null;
}
