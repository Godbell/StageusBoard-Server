import mongoose from 'mongoose';

export const logSchema = new mongoose.Schema(
  {
    ip: String,
    userIdx: Number,
    method: String,
    url: String,
  },
  {
    timestamps: {
      createdAt: 'created_at',
    },
  },
);
