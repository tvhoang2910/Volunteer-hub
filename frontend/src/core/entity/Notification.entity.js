import { BaseEntity } from './BaseEntity.entity';
import { User } from './User.entity';
import { Event } from './Event.entity';

export type NotificationType =
  | 'REGISTRATION_SUBMITTED'
  | 'REGISTRATION_CONFIRMED'
  | 'REGISTRATION_REJECTED'
  | 'COMPLETION_MARKED'
  | 'EVENT_CREATED_PENDING'
  | 'EVENT_APPROVED'
  | 'EVENT_REJECTED'
  | 'EVENT_UPDATED'
  | 'NEW_POST'
  | 'NEW_COMMENT'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'DATA_EXPORT_READY';

export class Notification extends BaseEntity {
  recipient!: User;
  event?: Event | null;
  title!: string;
  body!: string;
  notificationType!: NotificationType;
  isRead!: boolean;
}
