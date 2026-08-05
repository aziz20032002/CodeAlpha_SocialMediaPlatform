const express = require("express");
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getPostLikes,
} = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");
const uploadPostImage = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/", authMiddleware, uploadPostImage, createPost);
router.get("/", getAllPosts);
router.post("/:id/like", authMiddleware, likePost);
router.delete("/:id/like", authMiddleware, unlikePost);
router.get("/:id/likes", getPostLikes);
router.get("/:id", getPostById);
router.put("/:id", authMiddleware, uploadPostImage, updatePost);
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;
