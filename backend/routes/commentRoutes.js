const express = require("express");
const {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/posts/:postId/comments", authMiddleware, createComment);
router.get("/posts/:postId/comments", getPostComments);
router.put("/comments/:id", authMiddleware, updateComment);
router.delete("/comments/:id", authMiddleware, deleteComment);

module.exports = router;
