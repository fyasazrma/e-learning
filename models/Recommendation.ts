import { Schema, model, models } from "mongoose";

const RecommendationSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    basedOnAttemptId: {
      type: Schema.Types.ObjectId,
      ref: "ExerciseAttempt",
      default: null,
    },
    recommendedExerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      default: null,
    },
    reason: {
      type: String,
      default: "",
    },
    targetLevel: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "done"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    collection: "recommendations",
  }
);

const Recommendation =
  models.Recommendation || model("Recommendation", RecommendationSchema);

export default Recommendation;