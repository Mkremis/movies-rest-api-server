import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://martinkremis:fb9QUueXiQ5sjvAx@cluster0.qtc36xs.mongodb.net/?retryWrites=true&w=majority"

export const connectDB = async () => {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB is connected');
    } catch (error) {
      console.error(error);
    }
  };

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);