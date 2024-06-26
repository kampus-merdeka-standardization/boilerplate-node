import { Test, TestingModule } from '@nestjs/testing';
import { GrpcController } from '../../../app/grpc/grpc.controller';
import { PongService } from '../../../domain/services/ping.service';

describe('GrpcController', () => {
  let controller: GrpcController;
  let mockPongService: jest.Mocked<PongService>; // Make sure it's scoped correctly

  beforeEach(async () => {
    // Define mockPongService at the correct scope
    mockPongService = {
      getPong: jest.fn().mockReturnValue({
        data: 'pong',
        meta: {
          code: 200,
          message: 'Success',
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrpcController],
      providers: [
        {
          provide: PongService,
          useValue: mockPongService,
        },
      ],
    }).compile();

    controller = module.get<GrpcController>(GrpcController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a PingDto from getPong', () => {
    const result = controller.getPong({});
    expect(result).toEqual({
      data: 'pong',
      meta: {
        code: 200,
        message: 'Success',
      },
    });
    expect(mockPongService.getPong).toHaveBeenCalled();
  });

  it('should handle error response from PongService', () => {
    mockPongService.getPong.mockReturnValue({
      data: null,
      meta: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const result = controller.getPong({});
    expect(result.meta.code).toBe(500);
    expect(result.meta.message).toBe('Internal server error');
    expect(mockPongService.getPong).toHaveBeenCalled();
  });

  it('should handle null or undefined return from PongService', () => {
    mockPongService.getPong.mockReturnValue(null);

    const result = controller.getPong({});
    expect(result).toBeNull();
    expect(mockPongService.getPong).toHaveBeenCalled();
  });
});
