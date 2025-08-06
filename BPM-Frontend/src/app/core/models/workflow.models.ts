export interface BaseDto {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  isDeleted: boolean;
}

export interface WorkflowDto extends BaseDto {
  name: string;
  description?: string;
  version: number;
  isActive: boolean;
  steps: WorkflowStepDto[];
}

export interface CreateWorkflowDto {
  name: string;
  description?: string;
  version: number;
  isActive: boolean;
  steps: CreateWorkflowStepDto[];
}

export interface UpdateWorkflowDto {
  name: string;
  description?: string;
  version: number;
  isActive: boolean;
}

export interface WorkflowStepDto extends BaseDto {
  workflowId: string;
  stepName: string;
  order: number;
  responsibleRole: string;
  dueInHours?: number;
}

export interface CreateWorkflowStepDto {
  stepName: string;
  order: number;
  responsibleRole: string;
  dueInHours?: number;
}

export interface UpdateWorkflowStepDto {
  stepName: string;
  order: number;
  responsibleRole: string;
  dueInHours?: number;
}
