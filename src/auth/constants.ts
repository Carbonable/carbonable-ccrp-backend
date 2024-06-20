import * as dotenv from 'dotenv';
dotenv.config();
export const jwtConstants = {
  secret: process.env.JWT_KEY,
  duration: '1h',
};

export const CARBONABE_SALT = 78860;
