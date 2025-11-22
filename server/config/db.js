import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/collab_editor', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}


