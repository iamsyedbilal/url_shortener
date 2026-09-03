import dotenv from 'dotenv';
dotenv.config();

export const BaseURL = `${process.env.BASE_URL}:${process.env.PORT}`;
