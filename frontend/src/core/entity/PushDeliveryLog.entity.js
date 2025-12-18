import { BaseEntity } from './BaseEntity.entity';

export type PushDeliveryStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'INVALID_SUBSCRIPTION'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'MALFORMED_PAYLOAD';

export class PushDeliveryLog extends BaseEntity {
  userId!: string;
  endpoint!: string;
  notificationId?: string | null;
  httpStatusCode?: number | null;
  status!: PushDeliveryStatus;
  errorMessage?: string | null;
  retryCount!: number;
  payload?: string | null;
}
