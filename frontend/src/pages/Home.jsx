import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ImagePicker from "../components/ImagePicker";
import LikeButton from "../components/LikeButton";
import PostActionsMenu from "../components/PostActionsMenu";
import SkeletonLoader from "../components/SkeletonLoader";
import SocialIcon from "../components/SocialIcon";
import useAuth from "../context/useAuth";
import api from "../services/api";

const formatPostDate = (date) =>
  new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

function AuthorAvatar({ author }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = author?.name?.trim()?.charAt(0)?.toUpperCase() || "?";

  if (!author?.profile_image || imageFailed) {
    return (
      <span className="post-avatar post-avatar-placeholder" aria-hidden="true">
        {initial}
      </span>
    );
  }

  return (
    <img
      alt={`${author.name}'s profile`}
      className="post-avatar"
      onError={() => setImageFailed(true)}
      src={author.profile_image}
    />
  );
}

function PostImage({ post }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!post.image_url || imageFailed) {
    return null;
  }

  return (
    <img
      alt={`Post by ${post.author?.name || "community member"}`}
      className="post-image"
      loading="lazy"
      onError={() => setImageFailed(true)}
      src={post.image_url}
    />
  );
}

function Home() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createImage, setCreateImage] = useState(null);
  const [composerFocused, setComposerFocused] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [createdPostId, setCreatedPostId] = useState(null);
  const [removingPostId, setRemovingPostId] = useState(null);
  const composerInputRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadPosts = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/posts", {
          signal: controller.signal,
        });
        setPosts(response.data);
      } catch {
        if (!controller.signal.aborted) {
          setError("Unable to load posts.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadPosts();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const focusComposer = () => {
      if (window.location.hash !== "#create-post") return;
      setComposerFocused(true);
      window.requestAnimationFrame(() => composerInputRef.current?.focus());
    };

    focusComposer();
    window.addEventListener("hashchange", focusComposer);
    return () => window.removeEventListener("hashchange", focusComposer);
  }, []);

  const clearActionMessages = () => {
    setMessage("");
    setActionError("");
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    clearActionMessages();
    const content = createContent.trim();

    if (!content) {
      setActionError("Post content is required");
      return;
    }

    try {
      setCreating(true);
      const formData = new FormData();
      formData.append("content", content);
      if (createImage) {
        formData.append("image", createImage);
      }
      const response = await api.post("/posts", formData);
      const createdPost = {
        ...response.data.post,
        author: {
          id: user.id,
          name: user.name,
          profile_image: user.profile_image,
        },
      };
      setPosts((currentPosts) => [createdPost, ...currentPosts]);
      setCreatedPostId(createdPost.id);
      window.setTimeout(() => setCreatedPostId(null), 420);
      setCreateContent("");
      setCreateImage(null);
      setComposerFocused(false);
      form.reset();
      setMessage("Post created successfully.");
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Unable to create post.",
      );
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (post) => {
    clearActionMessages();
    setEditingId(post.id);
    setEditContent(post.content);
    setEditImage(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
    setEditImage(null);
  };

  const handleUpdate = async (event, post) => {
    event.preventDefault();
    clearActionMessages();
    const content = editContent.trim();

    if (!content) {
      setActionError("Post content is required");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("content", content);
      if (editImage) {
        formData.append("image", editImage);
      }
      const response = await api.put(`/posts/${post.id}`, formData);
      setPosts((currentPosts) =>
        currentPosts.map((currentPost) =>
          currentPost.id === post.id
            ? { ...response.data.post, author: currentPost.author }
            : currentPost,
        ),
      );
      cancelEditing();
      setMessage("Post updated successfully.");
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Unable to update post.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    clearActionMessages();

    try {
      setDeletingId(postId);
      await api.delete(`/posts/${postId}`);
      setRemovingPostId(postId);
      await new Promise((resolve) => window.setTimeout(resolve, 220));
      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postId),
      );
      setRemovingPostId(null);
      if (editingId === postId) {
        cancelEditing();
      }
      setMessage("Post deleted successfully.");
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Unable to delete post.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <header className="home-heading">
        <div>
          <span className="page-kicker">Community Feed</span>
          <h1 className="page-heading">Home</h1>
          <p className="page-intro">
            Share moments. Discover people. Stay connected.
          </p>
        </div>
      </header>

      {isAuthenticated ? (
        <form
          className={`create-post-card${composerFocused || createContent || createImage ? " composer-expanded" : ""}`}
          id="create-post"
          onSubmit={handleCreate}
        >
          <div className="composer-main">
            <AuthorAvatar author={user} />
            <div className="composer-input-wrap">
              <div className="create-post-header">
                <strong>{user.name}</strong>
                <span>Share an update with your community</span>
              </div>
              <label className="visually-hidden" htmlFor="create-content">
                Post content
              </label>
              <textarea
                disabled={creating}
                id="create-content"
                onChange={(event) => setCreateContent(event.target.value)}
                onFocus={() => setComposerFocused(true)}
                placeholder="What's on your mind?"
                ref={composerInputRef}
                rows={composerFocused || createContent || createImage ? 3 : 1}
                value={createContent}
              />
            </div>
          </div>
          <div className="composer-footer">
            <ImagePicker
              disabled={creating}
              file={createImage}
              onChange={(file) => {
                setCreateImage(file);
                if (file) setComposerFocused(true);
              }}
            />
            <div className="create-post-actions">
              <button className="button" disabled={creating} type="submit">
                {creating ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="login-prompt">
          <Link to="/login">Log in</Link> to create a post.
        </p>
      )}

      {message && <p className="action-message action-success" role="status">{message}</p>}
      {actionError && <p className="action-message action-error" role="alert">{actionError}</p>}

      <div className="feed" id="feed" aria-live="polite">
        {loading && <SkeletonLoader />}
        {!loading && error && <p className="feed-status feed-status-error" role="alert">{error}</p>}
        {!loading && !error && posts.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon" aria-hidden="true">
              <SocialIcon name="create" />
            </span>
            <strong>No posts yet</strong>
            <p>Be the first to share something with your community.</p>
          </div>
        )}

        {!loading &&
          !error &&
          posts.map((post) => {
            const isOwner =
              isAuthenticated && Number(post.author.id) === Number(user.id);
            const isEditing = editingId === post.id;
            const isDeleting = deletingId === post.id;

            return (
              <article
                className={`post-card${createdPostId === post.id ? " post-created" : ""}${removingPostId === post.id ? " post-removing" : ""}`}
                key={post.id}
              >
                <header className="post-header">
                  <AuthorAvatar author={post.author} />
                  <div className="post-meta">
                    <Link className="post-author" to={`/users/${post.author.id}`}>
                      {post.author.name}
                    </Link>
                    <time className="post-date" dateTime={post.created_at}>
                      {formatPostDate(post.created_at)}
                    </time>
                  </div>
                  {isOwner && !isEditing && (
                    <PostActionsMenu
                      deleting={isDeleting}
                      onDelete={() => handleDelete(post.id)}
                      onEdit={() => startEditing(post)}
                    />
                  )}
                </header>

                {isEditing ? (
                  <form className="edit-post-form" onSubmit={(event) => handleUpdate(event, post)}>
                    <label className="visually-hidden" htmlFor={`edit-content-${post.id}`}>Post content</label>
                    <textarea disabled={saving} id={`edit-content-${post.id}`} onChange={(event) => setEditContent(event.target.value)} rows="4" value={editContent} />
                    <ImagePicker
                      disabled={saving}
                      file={editImage}
                      label="Replace photo"
                      onChange={setEditImage}
                    />
                    <div className="edit-actions">
                      <button className="button" disabled={saving} type="submit">{saving ? "Saving..." : "Save"}</button>
                      <button className="button button-secondary" disabled={saving} onClick={cancelEditing} type="button">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="post-content">{post.content}</p>
                    <PostImage key={post.image_url || "no-image"} post={post} />
                  </>
                )}

                <footer className="post-footer">
                  <div className="post-navigation-actions">
                    <Link className="post-link" to={`/posts/${post.id}`}>
                      <SocialIcon name="comment" />
                      Comments
                    </Link>
                    <Link className="post-link" to={`/posts/${post.id}`}>
                      <SocialIcon name="arrow" />
                      View post
                    </Link>
                  </div>
                  <LikeButton postId={post.id} />
                </footer>
              </article>
            );
          })}
      </div>
    </section>
  );
}

export default Home;
