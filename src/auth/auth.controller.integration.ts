import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../infrastructure/prisma.service';
import * as request from 'supertest';
import { Role } from '../roles/role.enum';
import * as bcryptjs from 'bcryptjs';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { ValidationPipe } from '@nestjs/common';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let server: INestApplication<any>;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let adminToken: string;
  let userToken: string;
  const CARBONABLE_SALT = parseInt(process.env.CARBONABLE_SALT);
  beforeAll(async () => {
    try {
      const moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe());
      await app.init();
      jwtService = moduleFixture.get<JwtService>(JwtService);
      prismaService = moduleFixture.get<PrismaService>(PrismaService);
      server = app.getHttpServer();

      const admin = await prismaService.user.create({
        data: {
          id: '01J15QSHJBS6GKGXWTPDF1BYSH',
          name: 'admintest',
          password: await bcryptjs.hash('password', CARBONABLE_SALT),
          roles: [Role.User, Role.Admin],
          companyId: '1',
        },
      });
      // Insert regular user
      const user = await prismaService.user.create({
        data: {
          id: '02J15QSHJBS6GKGXWTPDF1BYSH',
          name: 'user',
          password: await bcryptjs.hash('password', CARBONABLE_SALT),
          roles: [Role.User],
          companyId: '1',
        },
      });
      // Generate tokens
      adminToken = await jwtService.signAsync({
        username: admin.name,
        sub: admin.id,
        roles: admin.roles,
      });
      userToken = await jwtService.signAsync({
        username: user.name,
        sub: user.id,
        roles: user.roles,
      });
    } catch (err) {
      console.error('Failed to init module ', err);
      fail('Cannot init module');
    }
  });
  afterAll(async () => {
    await app.close();
    await server.close();
  });
  it('should return an access token on successful login for admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admintest', password: 'password' })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
  });
  it('should return an access token on successful login for user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'user', password: 'password' })
      .expect(201);
    expect(response.body).toHaveProperty('access_token');
  });
  it('should throw UnauthorizedException on invalid login', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'invalid', password: 'password' })
      .expect(401);
  });
});
