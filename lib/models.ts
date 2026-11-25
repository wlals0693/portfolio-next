import mongoose, { Schema } from "mongoose";
const comment = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
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
export const UserModel =
  mongoose.models.User ||
  mongoose.model(
    "User",
    new Schema(
      {
        name: { type: String, required: true, maxlength: 40 },
        email: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
          trim: true,
        },
        passwordHash: { type: String, required: true, select: false },
        role: {
          type: String,
          enum: ["user", "admin"],
          default: "user",
          required: true,
        },
      },
      { timestamps: true },
    ),
  );
export const CurrentStatusModel =
  mongoose.models.CurrentStatus ||
  mongoose.model(
    "CurrentStatus",
    new Schema(
      {
        key: { type: String, unique: true, required: true },
        summary: { type: String, required: true, maxlength: 500 },
        milestones: [
          {
            title: { type: String, required: true, maxlength: 150 },
            status: {
              type: String,
              enum: ["완료", "진행 과제", "예정"],
              required: true,
            },
          },
        ],
      },
      { timestamps: true },
    ),
  );
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
