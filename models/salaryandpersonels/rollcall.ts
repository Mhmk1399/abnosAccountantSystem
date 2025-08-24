import mongoose, { Schema, Document, model, Types } from "mongoose";

// Interface for the daily attendance record
export interface IDailyRecord {
  day: number; // Day of the month (1-31)
  status: "present" | "absent" | "leave" | "holiday" | "permission" | "medical";
  entryTime?: string;
  launchtime?: string;
  exitTime?: string;
  description?: string;
}

// Interface for the monthly Rollcall document
export interface IRollcall extends Document {
  staff: Types.ObjectId;
  month: number;
  year: number;
  days: IDailyRecord[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for the individual day's record
const DailyRecordSchema: Schema = new Schema(
  {
    day: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },
    status: {
      type: String,
      enum: ["present", "absent", "holiday", "permission", "medical"],
      required: true,
    },
    entryTime: {
      type: String,
    },
    launchtime: {
      type: String,
      default: "1:00",
    },
    exitTime: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
); // _id is not needed for subdocuments in this case

// Schema for the monthly rollcall
const RollcallSchema: Schema = new Schema(
  {
    staff: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    days: [DailyRecordSchema],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Ensure that there is only one rollcall document per staff member per month

export default mongoose.models.Rollcall ||
  model<IRollcall>("Rollcall", RollcallSchema);
