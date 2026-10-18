import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 160,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "",
    },
    serviceType: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    timeline: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    budget: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    contactPreference: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "Email",
    },
    message: {
      type: String,
      required: [true, "Project brief is required"],
      trim: true,
      minlength: 10,
      maxlength: 4000,
    },
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved"],
      default: "new",
    },
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
