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
  foreignField: "category",
  localField: "_id",
});

courseCategorySchema.post(/^find/, function () {
  this.populate("courses");
});

const Category = mongoose.model("Category", courseCategorySchema);

module.exports = Category;
