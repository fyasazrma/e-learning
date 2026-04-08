import mongoose, { Schema, model, models } from "mongoose";

export interface IExercise {
  title: string;
  topicId: mongoose.Types.ObjectId | null;
  instruction: string;
  level: "easy" | "medium" | "hard";
  correctAnswer: string;
  isPublished: boolean;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      default: null,
    },
    instruction: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Exercise = models.Exercise || model<IExercise>("Exercise", ExerciseSchema);

export default Exercise;