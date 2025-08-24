import { DocumentWithCode } from "@/types/finalTypes";
import mongoose from "mongoose";

/**
 * Generates a unique sequential code for a given model
 * @param modelName The name of the model (e.g., "Customer", "Glass")
 * @param prefix Optional prefix for the code (e.g., "CUST", "GL")
 * @returns Promise with the next sequential code
 */

export async function generateSequentialCode(
  modelName: string,
  prefix: string = ""
): Promise<string> {
  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // Get the model
      const Model = mongoose.model(modelName);

      // Use MongoDB's findOneAndUpdate with upsert to atomically get and increment
      // We'll use a counter collection for this purpose
      const CounterModel =
        mongoose.models.Counter ||
        mongoose.model(
          "Counter",
          new mongoose.Schema({
            _id: { type: String, required: true },
            sequence_value: { type: Number, default: 0 },
          })
        );

      const counterId = `${modelName}_${prefix}`;

      // Atomically increment the counter
      const counter = await CounterModel.findOneAndUpdate(
        { _id: counterId },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );

      const nextNumber = counter.sequence_value;

      // Format the code with leading zeros (e.g., "001", "002")
      const formattedNumber = nextNumber.toString().padStart(4, "0");
      const newCode = prefix ? `${prefix}${formattedNumber}` : formattedNumber;

      // Double-check that this code doesn't exist (extra safety)
      const existingDoc = await Model.findOne({ code: newCode }).lean();

      if (!existingDoc) {
        return newCode;
      }

      // If code exists, retry (this should be very rare)
      retryCount++;
      console.warn(
        `Code ${newCode} already exists for ${modelName}, retrying... (${retryCount}/${maxRetries})`
      );
    } catch (error) {
      console.error(
        `Error generating code for ${modelName} (attempt ${retryCount + 1}):`,
        error
      );
      retryCount++;

      if (retryCount >= maxRetries) {
        throw new Error(
          `Failed to generate sequential code for ${modelName} after ${maxRetries} attempts`
        );
      }

      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 100 * retryCount));
    }
  }

  throw new Error(
    `Failed to generate unique sequential code for ${modelName} after ${maxRetries} attempts`
  );
}

/**
 * Alternative approach: Initialize counter for existing data
 * Call this function once for each model to set up the counter based on existing data
 */
export async function initializeCounter(
  modelName: string,
  prefix: string = ""
): Promise<void> {
  try {
    const Model = mongoose.model(modelName);
    const CounterModel =
      mongoose.models.Counter ||
      mongoose.model(
        "Counter",
        new mongoose.Schema({
          _id: { type: String, required: true },
          sequence_value: { type: Number, default: 0 },
        })
      );

    const counterId = `${modelName}_${prefix}`;

    // Check if counter already exists
    const existingCounter = await CounterModel.findById(counterId);
    if (existingCounter) {
      return; // Counter already initialized
    }

    // Find the highest existing code
    const lastDocument = (await Model.findOne({})
      .sort({ code: -1 })
      .limit(1)
      .lean()) as DocumentWithCode | null;

    let maxNumber = 0;

    if (lastDocument) {
      const lastCode = lastDocument.code;
      const numericPart = prefix
        ? parseInt(lastCode.replace(prefix, ""), 10)
        : parseInt(lastCode, 10);

      maxNumber = isNaN(numericPart) ? 0 : numericPart;
    }

    // Initialize counter with the max existing number
    await CounterModel.create({
      _id: counterId,
      sequence_value: maxNumber,
    });

    console.log(
      `Counter initialized for ${modelName} with prefix "${prefix}" starting at ${maxNumber}`
    );
  } catch (error) {
    console.error(`Error initializing counter for ${modelName}:`, error);
  }
}
