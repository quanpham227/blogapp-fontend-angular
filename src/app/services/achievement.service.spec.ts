import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AchievementService } from './achievement.service';
import { SuccessHandlerService } from './success-handler.service';
import { of } from 'rxjs';

describe('AchievementService', () => {
  let service: AchievementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Mock HttpClient
      providers: [AchievementService, SuccessHandlerService], // Khai báo các service
    });

    service = TestBed.inject(AchievementService); // Inject service
    httpMock = TestBed.inject(HttpTestingController); // Inject HttpTestingController
  });

  afterEach(() => {
    httpMock.verify(); // Đảm bảo không có request nào bị bỏ sót
  });
  it('should fetch achievements for admin and convert keys to camelCase', (done) => {
    const mockResponse = {
      message: 'Get list of achievements successfully',
      status: 'OK',
      data: [
        {
          id: 30,
          title: 'dsadsad',
          value: 445,
          description: 'zasadsad',
          created_at: '2024-12-30T15:29:02',
          updated_at: '2024-12-30T15:29:02',
          is_active: true,
        },
        {
          id: 32,
          title: 'dsadsadsa',
          value: 1554,
          description: 'dsadsadsad',
          created_at: '2024-12-31T23:18:50',
          updated_at: '2024-12-31T23:18:50',
          is_active: false,
        },
      ],
    };

    service.getAchievementsForAdmin().subscribe((response) => {
      expect(response).toEqual({
        message: 'Get list of achievements successfully',
        status: 'OK',
        data: [
          {
            id: 30,
            title: 'dsadsad',
            value: 445,
            description: 'zasadsad',
            createdAt: '2024-12-30T15:29:02',
            updatedAt: '2024-12-30T15:29:02',
            isActive: true,
          },
          {
            id: 32,
            title: 'dsadsadsa',
            value: 1554,
            description: 'dsadsadsad',
            createdAt: '2024-12-31T23:18:50',
            updatedAt: '2024-12-31T23:18:50',
            isActive: false,
          },
        ],
      });
      done();
    });

    const req = httpMock.expectOne(`${service['apiAchievement']}/admin`);
    expect(req.request.method).toBe('GET'); // Kiểm tra HTTP method
    req.flush(mockResponse); // Gửi response mock
  });
});
