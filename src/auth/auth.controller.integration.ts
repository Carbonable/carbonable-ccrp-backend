import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../infrastructure/prisma.service';
import * as request from 'supertest';
import { Role } from '../roles/role.enum';
import * as bcrypt from 'bcrypt';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { ValidationPipe } from '@nestjs/common';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let server: INestApplication<any>;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let adminToken: string, userToken: string;
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
          password: await bcrypt.hash('password', CARBONABLE_SALT),
          roles: [Role.User, Role.Admin],
        },
      });
      // Insert regular user
      const user = await prismaService.user.create({
        data: {
          id: '02J15QSHJBS6GKGXWTPDF1BYSH',
          name: 'user',
          password: await bcrypt.hash('password', CARBONABLE_SALT),
          roles: [Role.User],
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
  it('should create a new user successfully when called by an admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/createuser')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'newuser', password: 'newpassword' })
      .expect(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name', 'newuser');
    expect(response.body).toHaveProperty('roles', [Role.User]);
  });
  it('should throw ConflictException if username already exists', async () => {
    await request(app.getHttpServer())
      .post('/auth/createuser')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'admintest', password: 'password' })
      .expect(409);
  });
  it('should throw ForbiddenException if user is not admin', async () => {
    await request(app.getHttpServer())
      .post('/auth/createuser')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: 'newuser2', password: 'newpassword' })
      .expect(403);
  });
  it('shoud return user profile when called with correct jwt', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(response.body).toHaveProperty('username');
  });
  it('shoud throw a Forbidden Exception when called with incorrect jwt', async () => {
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${userToken}_wrong`)
      .expect(401);
  });
});
