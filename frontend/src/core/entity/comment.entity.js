import { BaseEntity } from './BaseEntity.entity';
import { Post } from './Post.entity';
import { User } from './User.entity';

export class Comment extends BaseEntity {
  content!: string;
  post!: Post;
  user!: User;
  parent?: Comment | null;
  replies!: Comment[];
}
