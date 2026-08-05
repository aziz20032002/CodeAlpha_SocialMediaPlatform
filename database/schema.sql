-- =========================================
-- CodeAlpha Social Media Platform
-- PostgreSQL Database Schema
-- =========================================

-- Optional:
-- Create the database manually in pgAdmin before running this file:
-- CREATE DATABASE codealpha_socialmedia;

-- =========================================
-- USERS
-- =========================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- POSTS
-- =========================================

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_posts_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =========================================
-- COMMENTS
-- =========================================

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comments_post
        FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE
);

-- =========================================
-- LIKES
-- =========================================

CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_user_post_like
        UNIQUE (user_id, post_id),

    CONSTRAINT fk_likes_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_likes_post
        FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE
);

-- =========================================
-- FOLLOWERS
-- =========================================

CREATE TABLE IF NOT EXISTS followers (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_follow_relationship
        UNIQUE (follower_id, following_id),

    CONSTRAINT prevent_self_follow
        CHECK (follower_id <> following_id),

    CONSTRAINT fk_followers_follower
        FOREIGN KEY (follower_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_followers_following
        FOREIGN KEY (following_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =========================================
-- USEFUL INDEXES
-- =========================================

CREATE INDEX IF NOT EXISTS idx_posts_user_id
ON posts(user_id);

CREATE INDEX IF NOT EXISTS idx_posts_created_at
ON posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_post_id
ON comments(post_id);

CREATE INDEX IF NOT EXISTS idx_comments_user_id
ON comments(user_id);

CREATE INDEX IF NOT EXISTS idx_likes_post_id
ON likes(post_id);

CREATE INDEX IF NOT EXISTS idx_likes_user_id
ON likes(user_id);

CREATE INDEX IF NOT EXISTS idx_followers_follower_id
ON followers(follower_id);

CREATE INDEX IF NOT EXISTS idx_followers_following_id
ON followers(following_id);