import User from '../models/user.model.js';
import { comparePasswords, hashPassword } from '../utils/password.js';
import ApiError from '../utils/apiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import crypto from 'crypto';
import Session from '../models/session.model.js';
import { Request, Response } from 'express';
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from '../utils/cookie.js';

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

  if (password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    username,
    email,
    passwordHash,
  });

  return user;
};

export const loginUser = async (userData: LoginInput, req: Request) => {
  const { email, password } = userData;

  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await comparePasswords(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const sessionId = crypto.randomUUID();

  const refreshToken = generateRefreshToken(user._id.toString(), sessionId);

  const refreshTokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  await Session.create({
    user: user._id,
    sessionId,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    lastUsedAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const accessToken = generateAccessToken(user._id.toString(), user.role);

  const userObject = user.toObject();
  const { passwordHash, ...userWithoutPassword } = userObject;

  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const logoutUser = async (refreshToken: string, res: Response) => {
  try {
    const decoded = verifyRefreshToken(refreshToken) as any;

    const session = await Session.findOneAndUpdate(
      {
        user: decoded.userId,
        sessionId: decoded.sessionId,
      },
      {
        revokedAt: new Date(),
      }
    );

    if (!session) {
      throw new ApiError(401, 'Invalid session');
    }
  } finally {
    clearRefreshTokenCookie(res);
  }
};

export const refreshAccessToken = async (
  refreshToken: string,
  res: Response
) => {
  const decoded = verifyRefreshToken(refreshToken) as {
    userId: string;
    sessionId: string;
  };

  const tokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  const session = await Session.findOne({
    user: decoded.userId,
    sessionId: decoded.sessionId,
    refreshTokenHash: tokenHash,
  });

  if (!session) {
    clearRefreshTokenCookie(res);
    throw new ApiError(401, 'Invalid session');
  }

  if (session.revokedAt) {
    clearRefreshTokenCookie(res);
    throw new ApiError(401, 'Session revoked');
  }

  if (session.expiresAt < new Date()) {
    await session.deleteOne();
    clearRefreshTokenCookie(res);
    throw new ApiError(401, 'Session expired');
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const accessToken = generateAccessToken(user._id.toString(), user.role);

  const newRefreshToken = generateRefreshToken(
    user._id.toString(),
    session.sessionId
  );

  session.refreshTokenHash = crypto
    .createHash('sha256')
    .update(newRefreshToken)
    .digest('hex');

  session.lastUsedAt = new Date();

  await session.save();

  setRefreshTokenCookie(res, newRefreshToken);

  return {
    accessToken,
  };
};
