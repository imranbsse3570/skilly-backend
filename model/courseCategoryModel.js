const mongoose = require("mongoose");

const courseCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title of the Category is required"],
  },
  slug: {
    type: String,
    unique: [true, "Slug must be unique"],
  },
});

const Category = mongoose.model("Category", courseCategorySchema);

module.exports = Category;
