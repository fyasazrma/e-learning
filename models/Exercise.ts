import mongoose, { Schema, model, models } from "mongoose";

export interface IExerciseOption {
  label: string;
  value: string;
}

export interface IExercise {
  title: string;
  topicId: mongoose.Types.ObjectId | null;
  instruction: string;
  level: "easy" | "medium" | "hard";
  questionType: "multiple_choice" | "essay";
  options?: IExerciseOption[];
  correctAnswer: string;
  explanation?: string;
  aiTip?: string;
  recommendedLevel?: "easy" | "medium" | "hard";
  createdBy?: mongoose.Types.ObjectId | null;
  isPublished: boolean;
}

const ExerciseOptionSchema = new Schema<IExerciseOption>(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

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
    questionType: {
      type: String,
      enum: ["multiple_choice", "essay"],
      default: "multiple_choice",
    },
    options: {
      type: [ExerciseOptionSchema],
      default: [],
    },
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      default: "",
    },
    aiTip: {
      type: String,
      default: "",
    },
    recommendedLevel: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
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