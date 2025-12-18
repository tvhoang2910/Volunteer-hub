import { BaseEntity } from './BaseEntity.entity';
import { Role } from './Role.entity';
import { Event } from './Event.entity';
import { Registration } from './Registration.entity';
import { Post } from './Post.entity';
import { PostReaction } from './PostReaction.entity';
import { Notification } from './Notification.entity';

export type UserRoleType = 'VOLUNTEER' | 'MANAGER' | 'ADMIN';

export class User extends BaseEntity {
  name!: string;
  email!: string;
  password?: string;
  isActive!: boolean;
  accountType!: UserRoleType;
  roles!: Role[];
  createdEvents!: Event[];
  registrations!: Registration[];
  approvedRegistrations!: Registration[];
  posts!: Post[];
  postReactions!: PostReaction[];
  notifications!: Notification[];
}
