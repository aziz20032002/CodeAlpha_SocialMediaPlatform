const pool = require("../config/db");
const fs = require("fs");

const isValidPostId = (id) =>
  /^\d+$/.test(id) && Number(id) > 0 && Number.isSafeInteger(Number(id));

const getUploadedImageUrl = (req) =>
  req.file
    ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    : null;

const discardUploadedFile = (file) => {
  if (file) {
    fs.unlink(file.path, () => {});
  }
};

// CREATE POST
const createPost = async (req, res) => {
  try {
    const { content } = req.body || {};

    if (typeof content !== "string" || content.trim() === "") {
      discardUploadedFile(req.file);
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    const result = await pool.query(
      `INSERT INTO posts (user_id, content, image_url)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, content, image_url, created_at`,
      [req.user.id, content.trim(), getUploadedImageUrl(req)]
    );

    return res.status(201).json({
      message: "Post created successfully",
      post: result.rows[0],
    });
  } catch (error) {
    discardUploadedFile(req.file);
    console.error("Create post error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// GET ALL POSTS
const getAllPosts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT posts.id,
              posts.content,
              posts.image_url,
              posts.created_at,
              json_build_object(
                'id', users.id,
                'name', users.name,
                'profile_image', users.profile_image
              ) AS author
       FROM posts
       INNER JOIN users ON posts.user_id = users.id
       ORDER BY posts.created_at DESC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get all posts error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// GET ONE POST
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidPostId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const result = await pool.query(
      `SELECT posts.id,
              posts.content,
              posts.image_url,
              posts.created_at,
              json_build_object(
                'id', users.id,
                'name', users.name,
                'profile_image', users.profile_image
              ) AS author
       FROM posts
       INNER JOIN users ON posts.user_id = users.id
       WHERE posts.id = $1`,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get post error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// UPDATE POST
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidPostId(id)) {
      discardUploadedFile(req.file);
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const postId = Number(id);
    const postResult = await pool.query(
      "SELECT user_id FROM posts WHERE id = $1",
      [postId]
    );

    if (postResult.rows.length === 0) {
      discardUploadedFile(req.file);
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (Number(postResult.rows[0].user_id) !== Number(req.user.id)) {
      discardUploadedFile(req.file);
      return res.status(403).json({
        message: "You are not allowed to update this post",
      });
    }

    const body = req.body || {};
    const hasContent = Object.prototype.hasOwnProperty.call(body, "content");
    const hasImage = Boolean(req.file);

    if (
      hasContent &&
      (typeof body.content !== "string" || body.content.trim() === "")
    ) {
      discardUploadedFile(req.file);
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    const result = await pool.query(
      `UPDATE posts
       SET content = CASE WHEN $1 THEN $2 ELSE content END,
           image_url = CASE WHEN $3 THEN $4 ELSE image_url END
       WHERE id = $5
       AND user_id = $6
       RETURNING id, user_id, content, image_url, created_at`,
      [
        hasContent,
        hasContent ? body.content.trim() : null,
        hasImage,
        getUploadedImageUrl(req),
        postId,
        req.user.id,
      ]
    );

    return res.status(200).json({
      message: "Post updated successfully",
      post: result.rows[0],
    });
  } catch (error) {
    discardUploadedFile(req.file);
    console.error("Update post error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// DELETE POST
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidPostId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const postId = Number(id);
    const postResult = await pool.query(
      "SELECT user_id FROM posts WHERE id = $1",
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (Number(postResult.rows[0].user_id) !== Number(req.user.id)) {
      return res.status(403).json({
        message: "You are not allowed to delete this post",
      });
    }

    const result = await pool.query(
      `DELETE FROM posts
       WHERE id = $1
       AND user_id = $2
       RETURNING id`,
      [postId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// LIKE POST
const likePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidPostId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const postId = Number(id);
    const postResult = await pool.query(
      "SELECT id FROM posts WHERE id = $1",
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const likeResult = await pool.query(
      `SELECT id
       FROM likes
       WHERE user_id = $1
       AND post_id = $2`,
      [req.user.id, postId]
    );

    if (likeResult.rows.length > 0) {
      return res.status(400).json({
        message: "You already liked this post",
      });
    }

    await pool.query(
      `INSERT INTO likes (user_id, post_id)
       VALUES ($1, $2)`,
      [req.user.id, postId]
    );

    return res.status(201).json({
      message: "Post liked successfully",
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        message: "You already liked this post",
      });
    }

    console.error("Like post error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// UNLIKE POST
const unlikePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidPostId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const postId = Number(id);
    const postResult = await pool.query(
      "SELECT id FROM posts WHERE id = $1",
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const result = await pool.query(
      `DELETE FROM likes
       WHERE user_id = $1
       AND post_id = $2
       RETURNING id`,
      [req.user.id, postId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "You have not liked this post",
      });
    }

    return res.status(200).json({
      message: "Post unliked successfully",
    });
  } catch (error) {
    console.error("Unlike post error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// GET POST LIKES
const getPostLikes = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidPostId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const postId = Number(id);
    const postResult = await pool.query(
      "SELECT id FROM posts WHERE id = $1",
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const result = await pool.query(
      `SELECT users.id, users.name, users.profile_image
       FROM likes
       INNER JOIN users ON likes.user_id = users.id
       WHERE likes.post_id = $1
       ORDER BY likes.created_at ASC`,
      [postId]
    );

    return res.status(200).json({
      count: result.rows.length,
      users: result.rows,
    });
  } catch (error) {
    console.error("Get post likes error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getPostLikes,
};
