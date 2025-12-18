import { BaseEntity} from "./BaseEntity.entity.js";
import { User } from "./User.entity.js";

export class Role extends BaseEntity {
    roleName!: string;
    description!: string;
    users!: User[];
}