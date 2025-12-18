import { Event } from './Event.entity';
import { User } from './User.entity';
import { PostReaction } from './PostReaction.entity';

export class Post extends BaseEntity {
  event!: Event;
  author!: User;
  content!: string;
  reactions!: PostReaction[];
  reactionCount!: number;
  commentCount!: number;
  recentReactionCount!: number;
  recentCommentCount!: number;
  recentLikeCount!: number;
  averageEdgeWeight!: number;
}