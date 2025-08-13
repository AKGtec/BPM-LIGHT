import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WorkflowService } from './workflow.service';
import { WorkflowDto, PaginatedResponse, ApiPaginatedResponse } from '../models';
import { environment } from '../../../environments/environment';

describe('WorkflowService', () => {
  let service: WorkflowService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WorkflowService]
    });
    service = TestBed.inject(WorkflowService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch workflows and map API response correctly', () => {
    const mockApiResponse: ApiPaginatedResponse<WorkflowDto> = {
      Data: [
        {
          id: 'ddd57dd1-1742-4b3f-897b-ec3b24e01a2a',
          name: 'new workflow',
          description: 'just for test',
          version: 1,
          isActive: true,
          steps: [],
          createdAt: new Date('2025-08-07T00:26:28.298953'),
          updatedAt: undefined
        }
      ],
      TotalCount: 7,
      PageNumber: 1,
      PageSize: 10,
      TotalPages: 1,
      HasPreviousPage: false,
      HasNextPage: false
    };

    const expectedResponse: PaginatedResponse<WorkflowDto> = {
      data: mockApiResponse.Data,
      totalCount: mockApiResponse.TotalCount,
      pageNumber: mockApiResponse.PageNumber,
      pageSize: mockApiResponse.PageSize,
      totalPages: mockApiResponse.TotalPages,
      hasPreviousPage: mockApiResponse.HasPreviousPage,
      hasNextPage: mockApiResponse.HasNextPage
    };

    service.getWorkflows({
      pageNumber: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    }).subscribe(response => {
      expect(response).toEqual(expectedResponse);
      expect(response.data.length).toBe(1);
      expect(response.data[0].name).toBe('new workflow');
      expect(response.totalCount).toBe(7);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/Workflow?pageNumber=1&pageSize=10&sortBy=createdAt&sortDirection=desc`);
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);
  });

  it('should handle empty workflow list', () => {
    const mockApiResponse: ApiPaginatedResponse<WorkflowDto> = {
      Data: [],
      TotalCount: 0,
      PageNumber: 1,
      PageSize: 10,
      TotalPages: 0,
      HasPreviousPage: false,
      HasNextPage: false
    };

    service.getWorkflows().subscribe(response => {
      expect(response.data.length).toBe(0);
      expect(response.totalCount).toBe(0);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/Workflow`);
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);
  });
});
