import mongoose from 'mongoose';

interface ISession extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  sessionId: string;
  refreshTokenHash: string;
  ip?: string | null;
  userAgent?: string | null;
  lastUsedAt: Date;
  revokedAt?: Date | null;
  expiresAt: Date;
}

const sessionSchema = new mongoose.Schema<ISession>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      unique: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: [true, 'Refresh token is required'],
      unique: true,
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: true,
    },
  },
  { timestamps: true }
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model<ISession>('Session', sessionSchema);

export default Session;
