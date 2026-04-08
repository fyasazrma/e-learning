import { Schema, model, models } from "mongoose";

const LearningProgressSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      default: null,
    },
    completedMaterials: {
      type: Number,
      default: 0,
    },
    completedExercises: {
      type: Number,
      default: 0,
    },
    completedQuizzes: {
      type: Number,
      default: 0,
    },
    currentLevel: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    lastFeedback: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "learning_progress",
  }
);

const LearningProgress =
  models.LearningProgress || model("LearningProgress", LearningProgressSchema);

export default LearningProgress;