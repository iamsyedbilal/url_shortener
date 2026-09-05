import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// ============================================================
// MOCK MODULES
// ============================================================

jest.unstable_mockModule('../../../src/models/user.model.js', () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule('../../../src/models/session.model.js', () => ({
  default: {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

jest.unstable_mockModule('../../../src/utils/password.js', () => ({
  hashPassword: jest.fn(),
  comparePasswords: jest.fn(),
}));

jest.unstable_mockModule('../../../src/utils/jwt.js', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

jest.unstable_mockModule('../../../src/utils/cookie.js', () => ({
  clearRefreshTokenCookie: jest.fn(),
  setRefreshTokenCookie: jest.fn(),
}));

jest.unstable_mockModule('crypto', () => ({
  default: {
    randomUUID: jest.fn(),
    createHash: jest.fn(),
  },
}));

// ============================================================
// IMPORT MOCKED MODULES
// ============================================================

const { default: User } = await import('../../../src/models/user.model.js');

const { default: Session } =
  await import('../../../src/models/session.model.js');

const { hashPassword, comparePasswords } =
  await import('../../../src/utils/password.js');

const { generateAccessToken, generateRefreshToken, verifyRefreshToken } =
  await import('../../../src/utils/jwt.js');

const { clearRefreshTokenCookie, setRefreshTokenCookie } =
  await import('../../../src/utils/cookie.js');

const { default: crypto } = await import('crypto');

// ============================================================
// IMPORT SERVICE AFTER ALL MOCKS
// ============================================================

const { registerUser, loginUser, logoutUser, refreshAccessToken } =
  await import('../../../src/services/auth.services.js');

// ============================================================
// TESTS
// ============================================================

describe('Auth Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================
  // registerUser
  // ==========================================================

  describe('registerUser', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        username: 'bilal',
        email: 'bilal@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const createdUser = {
        _id: 'user-id',
        username: 'bilal',
        email: 'bilal@example.com',
        passwordHash: 'hashed-password',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);

      (hashPassword as jest.Mock).mockResolvedValue('hashed-password');

      (User.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await registerUser(userData);

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ username: 'bilal' }, { email: 'bilal@example.com' }],
      });

      expect(hashPassword).toHaveBeenCalledWith('password123');

      expect(User.create).toHaveBeenCalledWith({
        username: 'bilal',
        email: 'bilal@example.com',
        passwordHash: 'hashed-password',
      });

      expect(result).toEqual(createdUser);
    });

    test('should throw error if username or email already exists', async () => {
      const userData = {
        username: 'bilal',
        email: 'bilal@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      (User.findOne as jest.Mock).mockResolvedValue({
        _id: 'existing-user',
      });

      await expect(registerUser(userData)).rejects.toMatchObject({
        statusCode: 400,
        message: 'Username or email already exists',
      });

      expect(hashPassword).not.toHaveBeenCalled();

      expect(User.create).not.toHaveBeenCalled();
    });

    test('should throw error if passwords do not match', async () => {
      const userData = {
        username: 'bilal',
        email: 'bilal@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(registerUser(userData)).rejects.toMatchObject({
        statusCode: 400,
        message: 'Passwords do not match',
      });

      expect(hashPassword).not.toHaveBeenCalled();

      expect(User.create).not.toHaveBeenCalled();
    });
  });

  // ==========================================================
  // loginUser
  // ==========================================================

  describe('loginUser', () => {
    test('should login user successfully', async () => {
      const userId = 'user-id';
      const sessionId = 'session-id';

      const user = {
        _id: {
          toString: () => userId,
        },
        email: 'bilal@example.com',
        username: 'bilal',
        role: 'user',
        passwordHash: 'hashed-password',

        toObject: () => ({
          _id: userId,
          email: 'bilal@example.com',
          username: 'bilal',
          role: 'user',
          passwordHash: 'hashed-password',
        }),
      };

      const select = jest.fn().mockResolvedValue(user);

      (User.findOne as jest.Mock).mockReturnValue({
        select,
      });

      (comparePasswords as jest.Mock).mockResolvedValue(true);

      (crypto.randomUUID as jest.Mock).mockReturnValue(sessionId);

      (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      (generateAccessToken as jest.Mock).mockReturnValue('access-token');

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('refresh-token-hash'),
      });

      (Session.create as jest.Mock).mockResolvedValue({});

      const req = {
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-user-agent'),
      } as any;

      const result = await loginUser(
        {
          email: 'bilal@example.com',
          password: 'password123',
        },
        req
      );

      expect(User.findOne).toHaveBeenCalledWith({
        email: 'bilal@example.com',
      });

      expect(select).toHaveBeenCalledWith('+passwordHash');

      expect(comparePasswords).toHaveBeenCalledWith(
        'password123',
        'hashed-password'
      );

      expect(generateRefreshToken).toHaveBeenCalledWith(userId, sessionId);

      expect(generateAccessToken).toHaveBeenCalledWith(userId, 'user');

      expect(Session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: user._id,
          sessionId,
          refreshTokenHash: 'refresh-token-hash',
          ip: '127.0.0.1',
          userAgent: 'test-user-agent',
          lastUsedAt: expect.any(Date),
          expiresAt: expect.any(Date),
        })
      );

      expect(result).toEqual({
        user: {
          _id: userId,
          email: 'bilal@example.com',
          username: 'bilal',
          role: 'user',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    test('should throw error when user does not exist', async () => {
      const select = jest.fn().mockResolvedValue(null);

      (User.findOne as jest.Mock).mockReturnValue({
        select,
      });

      const req = {} as any;

      await expect(
        loginUser(
          {
            email: 'unknown@example.com',
            password: 'password123',
          },
          req
        )
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid email or password',
      });

      expect(comparePasswords).not.toHaveBeenCalled();

      expect(Session.create).not.toHaveBeenCalled();
    });

    test('should throw error when password is incorrect', async () => {
      const user = {
        _id: {
          toString: () => 'user-id',
        },
        passwordHash: 'hashed-password',
      };

      const select = jest.fn().mockResolvedValue(user);

      (User.findOne as jest.Mock).mockReturnValue({
        select,
      });

      (comparePasswords as jest.Mock).mockResolvedValue(false);

      const req = {} as any;

      await expect(
        loginUser(
          {
            email: 'bilal@example.com',
            password: 'wrong-password',
          },
          req
        )
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid email or password',
      });

      expect(Session.create).not.toHaveBeenCalled();
    });

    test('should not return passwordHash in user response', async () => {
      const user = {
        _id: {
          toString: () => 'user-id',
        },
        email: 'bilal@example.com',
        username: 'bilal',
        role: 'user',
        passwordHash: 'hashed-password',

        toObject: () => ({
          _id: 'user-id',
          email: 'bilal@example.com',
          username: 'bilal',
          role: 'user',
          passwordHash: 'hashed-password',
        }),
      };

      const select = jest.fn().mockResolvedValue(user);

      (User.findOne as jest.Mock).mockReturnValue({
        select,
      });

      (comparePasswords as jest.Mock).mockResolvedValue(true);

      (crypto.randomUUID as jest.Mock).mockReturnValue('session-id');

      (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      (generateAccessToken as jest.Mock).mockReturnValue('access-token');

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hash'),
      });

      (Session.create as jest.Mock).mockResolvedValue({});

      const req = {
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent'),
      } as any;

      const result = await loginUser(
        {
          email: 'bilal@example.com',
          password: 'password123',
        },
        req
      );

      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  // ==========================================================
  // logoutUser
  // ==========================================================

  describe('logoutUser', () => {
    test('should logout user and revoke session successfully', async () => {
      (verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        sessionId: 'session-id',
      });

      (Session.findOneAndUpdate as jest.Mock).mockResolvedValue({
        _id: 'session-id',
      });

      const res = {} as any;

      await logoutUser('refresh-token', res);

      expect(verifyRefreshToken).toHaveBeenCalledWith('refresh-token');

      expect(Session.findOneAndUpdate).toHaveBeenCalledWith(
        {
          user: 'user-id',
          sessionId: 'session-id',
        },
        {
          revokedAt: expect.any(Date),
        }
      );

      expect(clearRefreshTokenCookie).toHaveBeenCalledWith(res);
    });

    test('should throw error if session does not exist', async () => {
      (verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        sessionId: 'session-id',
      });

      (Session.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const res = {} as any;

      await expect(logoutUser('refresh-token', res)).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid session',
      });

      expect(clearRefreshTokenCookie).toHaveBeenCalledWith(res);
    });

    test('should throw error for invalid refresh token', async () => {
      (verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const res = {} as any;

      await expect(logoutUser('invalid-token', res)).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid or expired session',
      });

      expect(clearRefreshTokenCookie).toHaveBeenCalledWith(res);
    });
  });

  // ==========================================================
  // refreshAccessToken
  // ==========================================================

  describe('refreshAccessToken', () => {
    test('should refresh access token successfully', async () => {
      const userId = 'user-id';
      const sessionId = 'session-id';

      (verifyRefreshToken as jest.Mock).mockReturnValue({
        userId,
        sessionId,
      });

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('token-hash'),
      });

      const session = {
        user: userId,
        sessionId,
        refreshTokenHash: 'token-hash',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        lastUsedAt: new Date(),
        save: jest.fn(),
      };

      (Session.findOne as jest.Mock).mockResolvedValue(session);

      const user = {
        _id: {
          toString: () => userId,
        },
        role: 'user',
      };

      (User.findById as jest.Mock).mockResolvedValue(user);

      (generateAccessToken as jest.Mock).mockReturnValue('new-access-token');

      (generateRefreshToken as jest.Mock).mockReturnValue('new-refresh-token');

      const res = {} as any;

      const result = await refreshAccessToken('old-refresh-token', res);

      expect(verifyRefreshToken).toHaveBeenCalledWith('old-refresh-token');

      expect(Session.findOne).toHaveBeenCalledWith({
        user: userId,
        sessionId,
        refreshTokenHash: 'token-hash',
      });

      expect(User.findById).toHaveBeenCalledWith(userId);

      expect(generateAccessToken).toHaveBeenCalledWith(userId, 'user');

      expect(generateRefreshToken).toHaveBeenCalledWith(userId, sessionId);

      expect(session.save).toHaveBeenCalled();

      expect(setRefreshTokenCookie).toHaveBeenCalledWith(
        res,
        'new-refresh-token'
      );

      expect(result).toEqual({
        accessToken: 'new-access-token',
      });
    });

    test('should throw error if session does not exist', async () => {
      (verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        sessionId: 'session-id',
      });

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('token-hash'),
      });

      (Session.findOne as jest.Mock).mockResolvedValue(null);

      const res = {} as any;

      await expect(
        refreshAccessToken('refresh-token', res)
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid session',
      });

      expect(clearRefreshTokenCookie).toHaveBeenCalledWith(res);
    });

    test('should throw error if session is revoked', async () => {
      (verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        sessionId: 'session-id',
      });

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('token-hash'),
      });

      (Session.findOne as jest.Mock).mockResolvedValue({
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
      });

      const res = {} as any;

      await expect(
        refreshAccessToken('refresh-token', res)
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Session revoked',
      });

      expect(clearRefreshTokenCookie).toHaveBeenCalledWith(res);
    });

    test('should delete expired session and throw error', async () => {
      (verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        sessionId: 'session-id',
      });

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('token-hash'),
      });

      const deleteOne = jest.fn();

      (Session.findOne as jest.Mock).mockResolvedValue({
        revokedAt: null,
        expiresAt: new Date(Date.now() - 60_000),
        deleteOne,
      });

      const res = {} as any;

      await expect(
        refreshAccessToken('refresh-token', res)
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Session expired',
      });

      expect(deleteOne).toHaveBeenCalled();

      expect(clearRefreshTokenCookie).toHaveBeenCalledWith(res);
    });

    test('should throw error if user does not exist', async () => {
      (verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        sessionId: 'session-id',
      });

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('token-hash'),
      });

      (Session.findOne as jest.Mock).mockResolvedValue({
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      });

      (User.findById as jest.Mock).mockResolvedValue(null);

      const res = {} as any;

      await expect(
        refreshAccessToken('refresh-token', res)
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });
    });
  });
});
