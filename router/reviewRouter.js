const express = require("express");
const reviewController = require("../controller/reviewController");

const router = express.Router();

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(reviewController.addNewReview);

router
  .route("/:id")
  .get(reviewController.getReview)
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);

module.exports = router;
