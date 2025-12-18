import { BaseEntity } from './BaseEntity.entity';
import { User } from './User.entity';
import { Registration } from './Registration.entity';
import { Post } from './Post.entity';
import { Notification } from './Notification.entity';

export type EventApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export class Event extends BaseEntity {
  createdBy!: User;
  title!: string;
  description?: string;
  location?: string;
  startTime!: Date;
  endTime!: Date;
  registrationDeadline?: Date | null;
  maxVolunteers?: number | null;
  adminApprovalStatus!: EventApprovalStatus;
  isArchived!: boolean;
  registrations!: Registration[];
  posts!: Post[];
  notifications!: Notification[];
}
