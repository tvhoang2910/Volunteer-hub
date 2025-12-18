import { BaseEntity } from './BaseEntity.entity'
import { Post } from './Post.entity'
import { User } from './User.entity'

export type ReactionType = 'LIKE' | 'CARE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY';

export class PostReaction extends BaseEntity {
  post!: Post;
  user!: User;
  reactionType!: ReactionType;
}
