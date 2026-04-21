import { Schema, model, models } from "mongoose";

const DeletionRequestSchema = new Schema(
  {
    itemType: {
      type: String,
      enum: ["material", "exercise"],
      required: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    itemTitle: {
      type: String,
      default: "",
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    adminNote: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "deletion_requests",
  }
);

const DeletionRequest =
  models.DeletionRequest || model("DeletionRequest", DeletionRequestSchema);

export default DeletionRequest;