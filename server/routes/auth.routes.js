const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe, logout } = require("../controllers/auth.controller");
const { registerValidator, loginValidator, validateRequest} = require("../middleware/authValidation");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/register",registerValidator,validateRequest,registerUser);
router.post("/login",loginValidator,validateRequest,loginUser);
router.get("/me",authMiddleware,getMe);
router.post("/logout",authMiddleware,logout);

module.exports = router;