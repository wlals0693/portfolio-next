import mongoose, { Schema } from "mongoose";
const comment = new Schema(
  {
    name: { type: String, required: true, maxlength: 40 },
    content: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true },
);
const project = new Schema(
  {
    seedKey: { type: String, unique: true, sparse: true },
    title: { type: String, required: true, maxlength: 100 },
    category: String,
    status: String,
    summary: { type: String, maxlength: 500 },
    tech: [String],
    features: [String],
    image: String,
    deployUrl: String,
    githubUrl: String,
    videoUrl: String,
    likes: { type: Number, default: 0 },
    likedBy: { type: [String], default: [], select: false },
    comments: { type: [comment], default: [] },
  },
  { timestamps: true },
);
export const ProjectModel =
  mongoose.models.Project || mongoose.model("Project", project);
export const MessageModel =
  mongoose.models.Message ||
  mongoose.model(
    "Message",
    new Schema(
      {
        name: { type: String, required: true, maxlength: 40 },
        email: { type: String, required: true, maxlength: 254 },
        content: { type: String, required: true, maxlength: 1000 },
      },
      { timestamps: true },
    ),
  );
