import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { ChangePasswordDto } from './password.dto';
import { BadRequestException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            updateUserPassword: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('changePassword', () => {
    it('should call updateUserPassword and return success message', async () => {
      const mockReq = { user: { sub: 'user-id' } };
      const changePasswordDto: ChangePasswordDto = {
        name: 'username',
        previousPassword: 'old-password',
        password: 'new-password',
      };

      jest
        .spyOn(usersService, 'updateUserPassword')
        .mockResolvedValue({ message: 'Password modified' });

      const result = await controller.changePassword(
        mockReq,
        changePasswordDto,
      );

      expect(usersService.updateUserPassword).toHaveBeenCalledWith(
        'user-id',
        'username',
        'old-password',
        'new-password',
      );
      expect(result).toEqual({ message: 'Password modified' });
    });

    it('should throw BadRequestException if updateUserPassword fails', async () => {
      const mockReq = { user: { sub: 'user-id' } };
      const changePasswordDto: ChangePasswordDto = {
        name: 'username',
        previousPassword: 'wrong-password',
        password: 'new-password',
      };

      jest
        .spyOn(usersService, 'updateUserPassword')
        .mockRejectedValue(
          new BadRequestException('Previous password is incorrect'),
        );

      await expect(
        controller.changePassword(mockReq, changePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
