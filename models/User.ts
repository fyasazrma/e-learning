import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  fullName: string;
  email: string;
  password: string;
  role: "admin" | "dosen" | "mahasiswa";
  npm?: string;
  nipd?: string;
  profileImage?: string;
  isActive?: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "dosen", "mahasiswa"],
      required: true,
    },
    npm: {
      type: String,
      default: "",
    },
    nipd: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = models.User || model<IUser>("User", UserSchema);

export default User;