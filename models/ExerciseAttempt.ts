import { Schema, model, models } from "mongoose";

export interface IExerciseAttempt {
  studentId?: string | null;
  exerciseId: string;
  topicId?: string | null;
  submittedAnswer: string;
  isCorrect: boolean;
  score: number;
  detectedErrors: string[];
  quickFeedback: string;
  recommendedLevel: "easy" | "medium" | "hard";
  createdAt?: Date;
  updatedAt?: Date;
}

const ExerciseAttemptSchema = new Schema<IExerciseAttempt>(
  {
    studentId: {
      type: String,
      default: null,
    },
    exerciseId: {
      type: String,
      required: true,
    },
    topicId: {
      type: String,
      default: null,
    },
    submittedAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    detectedErrors: {
      type: [String],
      default: [],
    },
    quickFeedback: {
      type: String,
      default: "",
    },
    recommendedLevel: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
  },
  {
    timestamps: true,
  }
);

const ExerciseAttempt =
  models.ExerciseAttempt ||
  model<IExerciseAttempt>("ExerciseAttempt", ExerciseAttemptSchema);

export default ExerciseAttempt;