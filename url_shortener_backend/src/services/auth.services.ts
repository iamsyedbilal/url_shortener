import User from '../models/user.model.js';
import { comparePasswords, hashPassword } from '../utils/password.js';
import ApiError from '../utils/apiError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

interface RegisterInput {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async (userData: RegisterInput) => {
  // Implement the logic to register the user in the database
  const { username, email, password, confirmPassword } = userData;

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existingUser) {
    throw new ApiError(400, 'Username or email already exists');
  }

  const passwordHash = await hashPassword(password);

  // Create a new user instance
  const savedUser = await User.create({
    username,
    email,
    passwordHash,
  });

  const user = await User.findById(savedUser._id);

  return user;
};

export const loginUser = async (userData: LoginInput) => {
  const { email, password } = userData;

  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await comparePasswords(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Password is incorrect');
  }

  const userWithoutPassword = await User.findById(user._id).select(
    '-passwordHash'
  );

  const accessToken = generateAccessToken(user._id.toString(), user.role);
  const refreshToken = generateRefreshToken(user._id.toString());

  return { user: userWithoutPassword, accessToken, refreshToken };
};
