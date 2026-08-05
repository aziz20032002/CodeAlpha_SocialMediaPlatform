const pool = require("../config/db");
const fs = require("fs");

const discardUploadedFile = (file) => {
  if (file) {
    fs.unlink(file.path, () => {});
  }
};

// GET MY PROFILE
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, name, email, bio, profile_image, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// UPDATE MY PROFILE
const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, bio, profile_image } = req.body || {};
    const profileImageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : profile_image;

    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           bio = COALESCE($2, bio),
           profile_image = COALESCE($3, profile_image)
       WHERE id = $4
       RETURNING id, name, email, bio, profile_image, created_at`,
      [name, bio, profileImageUrl, userId]
    );

    if (result.rows.length === 0) {
      discardUploadedFile(req.file);
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    discardUploadedFile(req.file);
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// GET PUBLIC USER PROFILE
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id) || Number(id) < 1 || !Number.isSafeInteger(Number(id))) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const result = await pool.query(
      `SELECT id, name, bio, profile_image, created_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get public profile error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// FOLLOW USER
const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { id } = req.params;

    if (!/^\d+$/.test(id) || Number(id) < 1 || !Number.isSafeInteger(Number(id))) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const followingId = Number(id);

    if (Number(followerId) === followingId) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const userResult = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [followingId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const followResult = await pool.query(
      `SELECT id
       FROM followers
       WHERE follower_id = $1
       AND following_id = $2`,
      [followerId, followingId]
    );

    if (followResult.rows.length > 0) {
      return res.status(400).json({
        message: "You already follow this user",
      });
    }

    await pool.query(
      `INSERT INTO followers (follower_id, following_id)
       VALUES ($1, $2)`,
      [followerId, followingId]
    );

    return res.status(201).json({
      message: "User followed successfully",
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        message: "You already follow this user",
      });
    }

    console.error("Follow user error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// UNFOLLOW USER
const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { id } = req.params;

    if (!/^\d+$/.test(id) || Number(id) < 1 || !Number.isSafeInteger(Number(id))) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const followingId = Number(id);

    if (Number(followerId) === followingId) {
      return res.status(400).json({
        message: "You cannot unfollow yourself",
      });
    }

    const userResult = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [followingId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const result = await pool.query(
      `DELETE FROM followers
       WHERE follower_id = $1
       AND following_id = $2
       RETURNING id`,
      [followerId, followingId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "You do not follow this user",
      });
    }

    return res.status(200).json({
      message: "User unfollowed successfully",
    });
  } catch (error) {
    console.error("Unfollow user error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// GET USER FOLLOWERS
const getUserFollowers = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id) || Number(id) < 1 || !Number.isSafeInteger(Number(id))) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const userId = Number(id);

    const userResult = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const result = await pool.query(
      `SELECT users.id, users.name, users.bio, users.profile_image
       FROM followers
       INNER JOIN users ON followers.follower_id = users.id
       WHERE followers.following_id = $1`,
      [userId]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get user followers error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// GET USERS FOLLOWED BY A USER
const getUserFollowing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id) || Number(id) < 1 || !Number.isSafeInteger(Number(id))) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const userId = Number(id);

    const userResult = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const result = await pool.query(
      `SELECT users.id, users.name, users.bio, users.profile_image
       FROM followers
       INNER JOIN users ON followers.following_id = users.id
       WHERE followers.follower_id = $1`,
      [userId]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get user following error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getUserProfile,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
};
