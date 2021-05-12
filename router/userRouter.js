const express = require("express");
const userController = require("../controller/userController");
const authController = require("../controller/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/verifyUser/:verifyToken", authController.verifyUser);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.use(authController.protect);

router.delete("/deleteMe", authController.deleteMyAccount);
router.patch("/updateMyPassword", authController.updateMyPassword);
router.patch("/updateMyEmail", authController.updateMyEmail);
router.patch("/updateMe", authController.updateMe);
router.get("/myProfile", authController.myProfile, userController.getUser);

router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.addNewUser);

router
  .route("/:id")
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.reactivateUser);

module.exports = router;
