import mongoose from "mongoose";

const FiscalYearSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
     taxRate: {
    type: Number,
    default: 0,
  },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
export default  mongoose.models.FiscalYear||mongoose.model('FiscalYear', FiscalYearSchema);