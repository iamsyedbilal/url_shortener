import bcrypt from 'bcryptjs';

const SALT_ROUNDS = process.env.SALT_ROUNDS
  ? parseInt(process.env.SALT_ROUNDS)
  : 10;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
