import { Schema, model, models } from "mongoose";

const FeedbackSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    exerciseAttemptId: {
      type: Schema.Types.ObjectId,
      ref: "ExerciseAttempt",
      default: null,
    },
    feedbackText: {
      type: String,
      default: "",
    },
    tipText: {
      type: String,
      default: "",
    },
    errorType: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "feedbacks",
  }
);

const Feedback = models.Feedback || model("Feedback", FeedbackSchema);

export default Feedback;