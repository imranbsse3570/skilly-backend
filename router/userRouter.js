const express = require("express");
const userController = require("../controller/userController");
const authController = require("../controller/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/verifyUser/:verifyToken", authController.verifyUser);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.post(
  "/deleteMe",
  authController.protect,
  authController.deleteMyAccount
);

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
