import { Schema, model, models } from "mongoose";

const ExerciseSubmissionSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      default: null,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      default: null,
    },
    questionTitle: {
      type: String,
      default: "",
    },
    submittedAnswer: {
      type: String,
      default: "",
    },
    isCorrect: {
      type: Boolean,
      default: false,
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
    feedbackText: {
      type: String,
      default: "",
    },
    tipText: {
      type: String,
      default: "",
    },
    reason: {
      type: String,
      default: "",
    },
    recommendedLevel: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    recommendedExerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "exercise_submissions",
  }
);

const ExerciseSubmission =
  models.ExerciseSubmission ||
  model("ExerciseSubmission", ExerciseSubmissionSchema);

export default ExerciseSubmission;