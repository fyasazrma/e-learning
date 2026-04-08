import { Schema, model, models } from "mongoose";

export interface ITopic {
  title: string;
  slug: string;
  description?: string;
  createdBy?: string | null;
}

const TopicSchema = new Schema<ITopic>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    createdBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Topic = models.Topic || model<ITopic>("Topic", TopicSchema);

export default Topic;