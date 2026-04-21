import { Schema, model, models } from "mongoose";

const AttendanceSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    status: {
      type: String,
      enum: ["present", "late", "absent"],
      default: "present",
    },
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "attendances",
  }
);

const Attendance = models.Attendance || model("Attendance", AttendanceSchema);

export default Attendance;