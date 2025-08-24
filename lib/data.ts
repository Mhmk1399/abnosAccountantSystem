import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
  try {
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB");
    } else {
      throw new Error("MONGODB_URI is not defined");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }

  const connectionstatus = mongoose.connection.readyState;
  if (connectionstatus === 1) {
    console.log("Connected to MongoDB");
  }
  if (connectionstatus === 0) {
    console.log("Not connected to MongoDB");
  }
  if (connectionstatus === 2) {
    console.log("Connecting to MongoDB");
  }
};

export default connect;
