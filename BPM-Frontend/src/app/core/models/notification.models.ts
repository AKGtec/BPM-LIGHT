import { BaseDto } from './workflow.models';

export enum NotificationType {
  Info = 1,
  Warning = 2,
  Error = 3,
  Success = 4,
  RequestUpdate = 5,
  WorkflowUpdate = 6
}

export interface NotificationDto extends BaseDto {
  userId: string;
  message: string;
  isRead: boolean;
  type: NotificationType;
  actionUrl?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export interface CreateNotificationDto {
  userId: string;
  message: string;
  type: NotificationType;
  actionUrl?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export interface MarkNotificationReadDto {
  notificationId: string;
}

export interface NotificationSummary {
  totalNotifications: number;
  unreadNotifications: number;
  notificationsByType: { [key in NotificationType]: number };
}
