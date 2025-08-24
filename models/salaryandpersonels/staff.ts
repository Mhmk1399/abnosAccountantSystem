import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema({
  title: {
    type: String,
    enum: ["خانم", "آقاي"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  fatherName: {
    type: String,
    required: true,
  },
  machineidNumber: {
    type: String,
    required: false,
  },
  birthPlace: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  nationalId: {
    type: String,
    required: true,
    unique: true,
  },
  insuranceNumber: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: false,
  },
  homePhone: {
    type: String,
  },
  mobilePhone: {
    type: String,
    required: true,
  },

  workExperience: {
    type: String,
  },
  position: {
    type: String,
    required: true,
  },
  workplace: {
    type: String,
    required: true,
  },
  educationLevel: {
    type: String,
    required: true,
  },
  contracthireDate: {
    type: Date,
    required: true,
  },
  contractendDate: {
    type: Date,
  },

  childrenCounts: {
    type: Number,
    required: true,
  },
  personalNumber:{
    type:String
  },
  ismaried: {
    type: Boolean,
    required: true,
  },
  baseSalary: {
    type: Number,
    
  },
  hourlywage: {
    type: Number,
  },
  housingAllowance: { type: Number },
  workerVoucher: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  detailedAccount:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"detailedAcounts",
  },
  isActive:{
    type:Boolean,
    default:"true"
  }
});

export default mongoose.models.Staff || mongoose.model("Staff", StaffSchema);
