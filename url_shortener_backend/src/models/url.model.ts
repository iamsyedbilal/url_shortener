import mongoose from 'mongoose';

interface IUrl extends mongoose.Document {
  originalUrl: string;
  shortCode: string;
  userId: mongoose.Types.ObjectId;
  clickCount: number;
  isActive: boolean;
}

const urlSchema = new mongoose.Schema<IUrl>(
  {
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      validate: {
        validator: function (value: string) {
          try {
            const url = new URL(value);
            return url.protocol === 'http:' || url.protocol === 'https:';
          } catch {
            return false;
          }
        },
        message: 'Please enter a valid HTTP or HTTPS URL',
      },
    },
    shortCode: {
      type: String,
      required: [true, 'Short code is required'],
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Url = mongoose.model<IUrl>('Url', urlSchema);

export default Url;
