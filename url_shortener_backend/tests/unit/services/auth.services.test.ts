import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// --------------------------------------------------
// Mocks
// --------------------------------------------------

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

// --------------------------------------------------
// Dynamic imports
// --------------------------------------------------

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

const { registerUser, loginUser, logoutUser, refreshAccessToken } =
  await import('../../../src/services/auth.services.js');

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const mockRequest = {
  ip: '127.0.0.1',
  get: jest.fn().mockReturnValue('test-user-agent'),
} as any;

const mockResponse = {} as any;

// --------------------------------------------------
// Tests
// --------------------------------------------------

describe('Auth Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================================================
  // registerUser
  // ==================================================

  describe('registerUser', () => {
    test('should register a new user successfully', async () => {
      (User.findOne as jest.Mock).mockImplementation(() =>
        Promise.resolve(null)
      );

      (hashPassword as jest.Mock).mockImplementation(() =>
        Promise.resolve('hashed-password')
      );

      const createdUser = {
        _id: 'user-id',
        username: 'bilal',
        email: 'bilal@example.com',
        passwordHash: 'hashed-password',
      };

      (User.create as jest.Mock).mockImplementation(() =>
        Promise.resolve(createdUser)
      );

      const result = await registerUser({
        username: 'bilal',
        email: 'bilal@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

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
      (User.findOne as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          _id: 'existing-user',
          username: 'bilal',
          email: 'bilal@example.com',
        })
      );

      await expect(
        registerUser({
          username: 'bilal',
          email: 'bilal@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Username or email already exists',
      });

      expect(User.create).not.toHaveBeenCalled();
      expect(hashPassword).not.toHaveBeenCalled();
    });

    test('should throw error if passwords do not match', async () => {
      (User.findOne as jest.Mock).mockImplementation(() =>
        Promise.resolve(null)
      );

      await expect(
        registerUser({
          username: 'bilal',
          email: 'bilal@example.com',
          password: 'password123',
          confirmPassword: 'different123',
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Passwords do not match',
      });

      expect(hashPassword).not.toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  // ==================================================
  // loginUser
  // ==================================================

  describe('loginUser', () => {
    test('should login successfully with valid credentials', async () => {
      const user = {
        _id: 'user-id',
        username: 'bilal',
        email: 'bilal@example.com',
        passwordHash: 'hashed-password',
        role: 'user',
        select: jest.fn() as jest.MockedFunction<() => Promise<any>>,
        toObject: jest.fn() as jest.MockedFunction<() => Record<string, any>>,
      };

      user.select.mockImplementation(() => Promise.resolve(user));

      user.toObject.mockImplementation(() => ({
        _id: 'user-id',
        username: 'bilal',
        email: 'bilal@example.com',
        passwordHash: 'hashed-password',
        role: 'user',
      }));

      (User.findOne as jest.Mock).mockImplementation(() => ({
        select: user.select,
      }));

      (comparePasswords as jest.Mock).mockImplementation(() =>
        Promise.resolve(true)
      );

      (crypto.randomUUID as jest.Mock).mockReturnValue('session-id');

      const hashUpdate = {
        digest: jest.fn().mockReturnValue('refresh-token-hash'),
      };

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue(hashUpdate),
      });

      (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      (generateAccessToken as jest.Mock).mockReturnValue('access-token');

      (Session.create as jest.Mock).mockImplementation(() =>
        Promise.resolve({})
      );

      const result = await loginUser(
        {
          email: 'bilal@example.com',
          password: 'password123',
        },
        mockRequest
      );

      expect(comparePasswords).toHaveBeenCalledWith(
        'password123',
        'hashed-password'
      );

      expect(Session.create).toHaveBeenCalled();

      expect(generateRefreshToken).toHaveBeenCalledWith(
        'user-id',
        'session-id'
      );

      expect(generateAccessToken).toHaveBeenCalledWith('user-id', 'user');

      expect(result).toEqual({
        user: {
          _id: 'user-id',
          username: 'bilal',
          email: 'bilal@example.com',
          role: 'user',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    test('should throw error if user does not exist', async () => {
      (User.findOne as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockImplementation(async () => null),
      }));

      await expect(
        loginUser(
          {
            email: 'notfound@example.com',
            password: 'password123',
          },
          mockRequest
        )
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid email or password',
      });

      expect(comparePasswords).not.toHaveBeenCalled();
      expect(Session.create).not.toHaveBeenCalled();
    });

    test('should throw error if password is incorrect', async () => {
      const user = {
        _id: 'user-id',
        email: 'bilal@example.com',
        passwordHash: 'hashed-password',
      };

      (User.findOne as jest.Mock).mockImplementation(() => ({
        select: (jest.fn() as jest.Mock).mockResolvedValue(user),
      }));

      (comparePasswords as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );

      await expect(
        loginUser(
          {
            email: 'bilal@example.com',
            password: 'wrong-password',
          },
          mockRequest
        )
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid email or password',
      });

      expect(Session.create).not.toHaveBeenCalled();
    });

    test('should not return passwordHash in user response', async () => {
      const user = {
        _id: 'user-id',
        username: 'bilal',
        email: 'bilal@example.com',
        passwordHash: 'hashed-password',
        role: 'user',
        select: jest.fn(),
        toObject: jest.fn(),
      };

      user.select.mockResolvedValue(user);

      user.toObject.mockReturnValue({
        _id: 'user-id',
        username: 'bilal',
        email: 'bilal@example.com',
        passwordHash: 'hashed-password',
        role: 'user',
      });

      (User.findOne as jest.Mock).mockImplementation(() => ({
        select: user.select,
      }));

      (
        comparePasswords as jest.MockedFunction<typeof comparePasswords>
      ).mockResolvedValue(true);

      (crypto.randomUUID as jest.Mock).mockReturnValue('session-id');

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          digest: jest.fn().mockReturnValue('hash'),
        }),
      });

      (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      (generateAccessToken as jest.Mock).mockReturnValue('access-token');

      (Session.create as jest.Mock).mockImplementation(() =>
        Promise.resolve({} as any)
      );

      const result = await loginUser(
        {
          email: 'bilal@example.com',
          password: 'password123',
        },
        mockRequest
      );

      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  // ==================================================
  // logoutUser
  // ==================================================

  describe('logoutUser', () => {
    test('should logout successfully and revoke session', async () => {
      (verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        sessionId: 'session-id',
      });

      const session = {
        _id: 'session-id',
      };

      (Session.findOneAndUpdate as jest.Mock).mockImplementation(() =>
        Promise.resolve(session)
      );

      await logoutUser('refresh-token', mockResponse);

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

      expect(clearRefreshTokenCookie).toHaveBeenCalledWith(mockResponse);
    });

    test('should throw error if session does not exist', async () => {
      (verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        sessionId: 'session-id',
      });

      (Session.findOneAndUpdate as jest.Mock).mockImplementation(() =>
        Promise.resolve(null)
      );

      await expect(
        logoutUser('refresh-token', mockResponse)
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid session',
      });

      expect(clearRefreshTokenCookie).toHaveBeenCalledWith(mockResponse);
    });

    test('should throw error for invalid refresh token', async () => {
      (verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        logoutUser('invalid-token', mockResponse)
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid or expired session',
      });

      expect(clearRefreshTokenCookie).toHaveBeenCalledWith(mockResponse);

      expect(Session.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  // ==================================================
  // refreshAccessToken
  // ==================================================

  describe('refreshAccessToken', () => {
    test('should refresh access token successfully', async () => {
      (verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        sessionId: 'session-id',
      });

      const digest = jest.fn().mockReturnValue('new-refresh-token-hash');

      const update = jest.fn().mockReturnValue({
        digest,
      });

      (crypto.createHash as jest.Mock).mockReturnValue({
        update,
      });

      const session = {
        revokedAt: null,
        expiresAt: new Date(Date.now() + 100000),
        refreshTokenHash: 'old-hash',
        sessionId: 'session-id',
        save: jest.fn().mockImplementation(() => Promise.resolve(undefined)),
      };

      (Session.findOne as jest.Mock).mockImplementation(() =>
        Promise.resolve(session)
      );

      (User.findById as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          _id: 'user-id',
          role: 'user',
        })
      );

      (generateAccessToken as jest.Mock).mockReturnValue('new-access-token');

      (generateRefreshToken as jest.Mock).mockReturnValue('new-refresh-token');

      const result = await refreshAccessToken(
        'old-refresh-token',
        mockResponse
      );

      expect(verifyRefreshToken).toHaveBeenCalledWith('old-refresh-token');

      expect(Session.findOne).toHaveBeenCalled();

      expect(User.findById).toHaveBeenCalledWith('user-id');

      expect(generateAccessToken).toHaveBeenCalledWith('user-id', 'user');

      expect(generateRefreshToken).toHaveBeenCalledWith(
        'user-id',
        'session-id'
      );

      expect(session.save).toHaveBeenCalled();

      expect(setRefreshTokenCookie).toHaveBeenCalledWith(
        mockResponse,
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
        update: jest.fn().mockReturnValue({
          digest: jest.fn().mockReturnValue('token-hash'),
        }),
      });

      (Session.findOne as jest.Mock).mockImplementation(() =>
        Promise.resolve(null)
      );

      await expect(
        refreshAccessToken('refresh-token', mockResponse)
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid session',
      });

      expect(clearRefreshTokenCookie).toHaveBeenCalledWith(mockResponse);
    });

    test('should throw error if session is revoked', async () => {
      (verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        sessionId: 'session-id',
      });

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          digest: jest.fn().mockReturnValue('token-hash'),
        }),
      });

      (Session.findOne as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          revokedAt: new Date(),
          expiresAt: new Date(Date.now() + 100000),
        })
      );

      await expect(
        refreshAccessToken('refresh-token', mockResponse)
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Session revoked',
      });

      expect(clearRefreshTokenCookie).toHaveBeenCalledWith(mockResponse);
    });

    test('should throw error if session is expired', async () => {
      (verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        sessionId: 'session-id',
      });

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          digest: jest.fn().mockReturnValue('token-hash'),
        }),
      });

      const deleteOne = jest
        .fn()
        .mockImplementation(() => Promise.resolve(undefined));

      (Session.findOne as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          revokedAt: null,
          expiresAt: new Date(Date.now() - 100000),
          deleteOne,
        })
      );

      await expect(
        refreshAccessToken('refresh-token', mockResponse)
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Session expired',
      });

      expect(deleteOne).toHaveBeenCalled();

      expect(clearRefreshTokenCookie).toHaveBeenCalledWith(mockResponse);
    });

    test('should throw error if user does not exist', async () => {
      (verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        sessionId: 'session-id',
      });

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          digest: jest.fn().mockReturnValue('token-hash'),
        }),
      });

      (Session.findOne as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          revokedAt: null,
          expiresAt: new Date(Date.now() + 100000),
        })
      );

      (User.findById as jest.Mock).mockImplementation(() =>
        Promise.resolve(null)
      );

      await expect(
        refreshAccessToken('refresh-token', mockResponse)
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });
    });
  });
});
