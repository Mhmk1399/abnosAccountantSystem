import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    info: {
      type: String,
      required: true,
    },   
    detailedAcount:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"DetailedAccount",
     }
  },
  { timestamps: true }
);
export default mongoose.models.Provider || mongoose.model("Provider", providerSchema);
