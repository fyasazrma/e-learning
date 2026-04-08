import { Schema, model, models } from "mongoose";

const MaterialSchema = new Schema(
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
    description: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },

    fileName: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileType: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    contentType: {
      type: String,
      enum: ["text", "file"],
      default: "text",
    },

    thumbnail: {
      type: String,
      default: "",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    targetRole: {
      type: [String],
      default: ["mahasiswa"],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "materials",
  }
);

const Material = models.Material || model("Material", MaterialSchema);

export default Material;