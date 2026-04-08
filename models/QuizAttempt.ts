import { Schema, model, models } from "mongoose";

const AnswerSchema = new Schema(
  {
    questionIndex: Number,
    selectedAnswer: String,
    isCorrect: Boolean,
  },
  { _id: false }
);

const QuizAttemptSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      default: null,
    },
    answers: {
      type: [AnswerSchema],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "quiz_attempts",
  }
);

const QuizAttempt =
  models.QuizAttempt || model("QuizAttempt", QuizAttemptSchema);

export default QuizAttempt;