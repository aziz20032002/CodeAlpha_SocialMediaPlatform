const pool = require("../config/db");

const isValidId = (id) =>
  /^\d+$/.test(id) && Number(id) > 0 && Number.isSafeInteger(Number(id));

// CREATE COMMENT
const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body || {};

    if (!isValidId(postId)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    if (typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }

    const numericPostId = Number(postId);
    const postResult = await pool.query(
      "SELECT id FROM posts WHERE id = $1",
      [numericPostId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const result = await pool.query(
      `INSERT INTO comments (user_id, post_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, post_id, content, created_at`,
      [req.user.id, numericPostId, content.trim()]
    );

    return res.status(201).json({
      message: "Comment added successfully",
      comment: result.rows[0],
    });
  } catch (error) {
    console.error("Create comment error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// GET POST COMMENTS
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!isValidId(postId)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const numericPostId = Number(postId);
    const postResult = await pool.query(
      "SELECT id FROM posts WHERE id = $1",
      [numericPostId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const result = await pool.query(
      `SELECT comments.id,
              comments.content,
              comments.created_at,
              json_build_object(
                'id', users.id,
                'name', users.name,
                'profile_image', users.profile_image
              ) AS author
       FROM comments
       INNER JOIN users ON comments.user_id = users.id
       WHERE comments.post_id = $1
       ORDER BY comments.created_at ASC`,
      [numericPostId]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get post comments error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// UPDATE COMMENT
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body || {};

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid comment ID",
      });
    }

    if (typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }

    const commentId = Number(id);
    const commentResult = await pool.query(
      "SELECT user_id FROM comments WHERE id = $1",
      [commentId]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (Number(commentResult.rows[0].user_id) !== Number(req.user.id)) {
      return res.status(403).json({
        message: "You are not allowed to update this comment",
      });
    }

    const result = await pool.query(
      `UPDATE comments
       SET content = $1
       WHERE id = $2
       AND user_id = $3
       RETURNING id, user_id, post_id, content, created_at`,
      [content.trim(), commentId, req.user.id]
    );

    return res.status(200).json({
      message: "Comment updated successfully",
      comment: result.rows[0],
    });
  } catch (error) {
    console.error("Update comment error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// DELETE COMMENT
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid comment ID",
      });
    }

    const commentId = Number(id);
    const commentResult = await pool.query(
      "SELECT user_id FROM comments WHERE id = $1",
      [commentId]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (Number(commentResult.rows[0].user_id) !== Number(req.user.id)) {
      return res.status(403).json({
        message: "You are not allowed to delete this comment",
      });
    }

    const result = await pool.query(
      `DELETE FROM comments
       WHERE id = $1
       AND user_id = $2
       RETURNING id`,
      [commentId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
};
