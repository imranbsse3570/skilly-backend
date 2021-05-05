const express = require("express");
const userController = require("../controller/userController");

const router = express.Router();

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.addNewUser);

router
  .route("/:id")
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

module.exports = router;
