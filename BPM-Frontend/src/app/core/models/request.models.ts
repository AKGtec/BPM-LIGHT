import { BaseDto } from './workflow.models';

export enum RequestType {
  Leave = 1,
  Expense = 2,
  Training = 3,
  ITSupport = 4,
  ProfileUpdate = 5
}

export enum RequestStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Archived = 4
}

export enum StepStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3
}

export interface RequestDto extends BaseDto {
  type: RequestType;
  initiatorId: string;
  initiatorName: string;
  status: RequestStatus;
  description?: string;
  title?: string;
  requestSteps: RequestStepDto[];
}

export interface CreateRequestDto {
  type: RequestType;
  description?: string;
  title?: string;
  workflowId: string;
}

export interface UpdateRequestDto {
  type: RequestType;
  description?: string;
  title?: string;
  status: RequestStatus;
}

export interface RequestStepDto extends BaseDto {
  requestId: string;
  workflowStepId: string;
  workflowStepName: string;
  responsibleRole: string;
  status: StepStatus;
  validatedAt?: Date;
  validatorId?: string;
  validatorName?: string;
  comments?: string;
}

export interface ApproveRejectStepDto {
  comments?: string;
}

export interface RequestSummary {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  archivedRequests: number;
  requestsByType: {
    leave: number;
    expense: number;
    training: number;
    itSupport: number;
    profileUpdate: number;
  };
  requestsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    archived: number;
  };
}
