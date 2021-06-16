const mongoose = require("mongoose");

const courseCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title of the Category is required"],
    },
    slug: {
      type: String,
      unique: [true, "Slug must be unique"],
    },
    previewImage: {
      type: String,
      default: "default.jpg",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

courseCategorySchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "category",
});

courseCategorySchema.pre(/^find/, function (next) {
  this.populate("courses");
  next();
});

const Category = mongoose.model("Category", courseCategorySchema);

module.exports = Category;
