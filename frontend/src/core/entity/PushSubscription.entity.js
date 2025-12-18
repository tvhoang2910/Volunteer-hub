import { BaseEntity } from "./BaseEntity.entity";
import { User } from "./User.entity";

export class PushSubscription extends BaseEntity {
    user!: User;
    endpoint!: string;
    p256dh!: string;
    auth!: string;
}