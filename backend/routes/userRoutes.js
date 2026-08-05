const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
  getUserProfile,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const { uploadProfileImage } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/me", authMiddleware, getMyProfile);
router.put("/me", authMiddleware, uploadProfileImage, updateMyProfile);

router.post("/:id/follow", authMiddleware, followUser);
router.delete("/:id/follow", authMiddleware, unfollowUser);
router.get("/:id/followers", getUserFollowers);
router.get("/:id/following", getUserFollowing);

// Public user profile
router.get("/:id", getUserProfile);

module.exports = router;
