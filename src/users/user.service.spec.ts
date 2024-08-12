import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../infrastructure/prisma.service';
import { ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should throw ConflictException if username already exists', async () => {
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue({ id: '1', name: 'existingUser' });

      await expect(
        service.createUser('existingUser', 'password'),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a new user if username does not exist', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(prismaService.user, 'create').mockResolvedValue({
        id: '1',
        name: 'newUser',
        password: 'hashedPassword',
        roles: ['user'],
      });

      const result = await service.createUser('newUser', 'password');

      expect(result).toEqual({ id: '1', name: 'newUser', roles: ['user'] });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          name: 'newUser',
          password: 'hashedPassword',
          roles: ['user'],
        },
      });
    });
  });

  describe('updateUserPassword', () => {
    it('should throw BadRequestException if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updateUserPassword(
          'nonExistentUserId',
          'oldPassword',
          'newPassword',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if previous password is incorrect', async () => {
      const user = { id: '1', password: 'hashedPassword' };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        service.updateUserPassword('1', 'wrongPassword', 'newPassword'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update the password if previous password is correct', async () => {
      const user = { id: '1', password: 'hashedPassword' };
      const newHashedPassword = 'newHashedPassword';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(newHashedPassword);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...user,
        password: newHashedPassword,
      });

      const result = await service.updateUserPassword(
        '1',
        'oldPassword',
        'newPassword',
      );

      expect(result).toEqual({ message: 'Password modified' });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: newHashedPassword },
      });
    });
  });

  describe('findOneByName', () => {
    it('should return the user with the given name', async () => {
      const user = {
        id: '1',
        name: 'testuser',
        password: 'hashedPassword',
        roles: ['user'],
      };
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(user);

      const result = await service.findOneByName('testuser');
      expect(result).toEqual(user);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { name: 'testuser' },
      });
    });
  });

  describe('findOneById', () => {
    it('should return the user with the given id', async () => {
      const user = {
        id: '1',
        name: 'testuser',
        password: 'hashedPassword',
        roles: ['user'],
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const result = await service.findOneById('1');
      expect(result).toEqual(user);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('fetchAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: '1', name: 'user1', password: 'hashedPassword', roles: ['user'] },
        { id: '2', name: 'user2', password: 'hashedPassword', roles: ['user'] },
      ];
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(users);

      const result = await service.fetchAll();
      expect(result).toEqual(users);
      expect(prismaService.user.findMany).toHaveBeenCalled();
    });
  });
});
