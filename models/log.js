import mongoose from 'mongoose';

export const logSchema = new mongoose.Schema(
  {
    ip: String,
    userIdx: Number,
    method: String,
    api: String,
  },
  {
    timestamps: {
      createdAt: 'created_at',
    },
  },
);
