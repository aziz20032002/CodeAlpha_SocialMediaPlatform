import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LikeButton from "../components/LikeButton";
import SkeletonLoader from "../components/SkeletonLoader";
import useAuth from "../context/useAuth";
import api from "../services/api";

const formatDate = (date) =>
  new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

function Avatar({ author, className = "" }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = author?.name?.trim()?.charAt(0)?.toUpperCase() || "?";

  if (!author?.profile_image || imageFailed) {
    return (
      <span
        className={`post-avatar post-avatar-placeholder ${className}`}
        aria-hidden="true"
      >
        {initial}
      </span>
    );
  }

  return (
    <img
      alt={`${author.name}'s profile`}
      className={`post-avatar ${className}`}
      onError={() => setImageFailed(true)}
      src={author.profile_image}
    />
  );
}

function PostMedia({ post }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!post?.image_url || imageFailed) {
    return null;
  }

  return (
    <img
      alt={`Post by ${post.author.name}`}
      className="post-image"
      onError={() => setImageFailed(true)}
      src={post.image_url}
    />
  );
}

function PostDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [postLoading, setPostLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [postError, setPostError] = useState("");
  const [commentsError, setCommentsError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [createdCommentId, setCreatedCommentId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadPost = async () => {
      try {
        setPostLoading(true);
        setPostError("");
        const response = await api.get(`/posts/${id}`, {
          signal: controller.signal,
        });
        setPost(response.data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setPostError(
            err.response?.data?.message || "Unable to load post.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setPostLoading(false);
        }
      }
    };

    const loadComments = async () => {
      try {
        setCommentsLoading(true);
        setCommentsError("");
        const response = await api.get(`/posts/${id}/comments`, {
          signal: controller.signal,
        });
        setComments(response.data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setCommentsError(
            err.response?.data?.message || "Unable to load comments.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCommentsLoading(false);
        }
      }
    };

    loadPost();
    loadComments();

    return () => controller.abort();
  }, [id]);

  const clearActionMessages = () => {
    setActionMessage("");
    setActionError("");
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    clearActionMessages();
    const content = newComment.trim();

    if (!content) {
      setActionError("Comment content is required");
      return;
    }

    try {
      setPosting(true);
      const response = await api.post(`/posts/${id}/comments`, { content });
      const createdComment = {
        ...response.data.comment,
        author: {
          id: user.id,
          name: user.name,
          profile_image: user.profile_image,
        },
      };
      setComments((currentComments) => [
        ...currentComments,
        createdComment,
      ]);
      setCreatedCommentId(createdComment.id);
      window.setTimeout(() => setCreatedCommentId(null), 320);
      setNewComment("");
      setActionMessage("Comment added successfully.");
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Unable to add comment.",
      );
    } finally {
      setPosting(false);
    }
  };

  const startEditing = (comment) => {
    clearActionMessages();
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleUpdate = async (event, comment) => {
    event.preventDefault();
    clearActionMessages();
    const content = editContent.trim();

    if (!content) {
      setActionError("Comment content is required");
      return;
    }

    try {
      setSaving(true);
      const response = await api.put(`/comments/${comment.id}`, { content });
      setComments((currentComments) =>
        currentComments.map((currentComment) =>
          currentComment.id === comment.id
            ? {
                ...response.data.comment,
                author: currentComment.author,
              }
            : currentComment,
        ),
      );
      cancelEditing();
      setActionMessage("Comment updated successfully.");
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Unable to update comment.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    clearActionMessages();

    try {
      setDeletingId(commentId);
      await api.delete(`/comments/${commentId}`);
      setComments((currentComments) =>
        currentComments.filter((comment) => comment.id !== commentId),
      );
      if (editingId === commentId) {
        cancelEditing();
      }
      setActionMessage("Comment deleted successfully.");
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Unable to delete comment.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (postLoading) {
    return <SkeletonLoader />;
  }

  if (postError || !post) {
    return (
      <p className="feed-status feed-status-error" role="alert">
        {postError || "Post not found"}
      </p>
    );
  }

  return (
    <section className={`post-details-page${post.image_url ? " has-media" : ""}`}>
      <h1 className="page-heading">Post Details</h1>

      <article className="post-card post-detail-card">
        <header className="post-header">
          <Avatar author={post.author} />
          <div>
            <Link className="post-author" to={`/users/${post.author.id}`}>
              {post.author.name}
            </Link>
            <time className="post-date" dateTime={post.created_at}>
              {formatDate(post.created_at)}
            </time>
          </div>
        </header>
        <p className="post-content">{post.content}</p>
        <PostMedia post={post} />
        <div className="post-detail-actions">
          <LikeButton postId={post.id} />
        </div>
      </article>

      <section className="comments-section" aria-labelledby="comments-title">
        <div className="comments-heading">
          <h2 id="comments-title">Comments</h2>
          {!commentsLoading && !commentsError && (
            <span>{comments.length}</span>
          )}
        </div>

        {isAuthenticated ? (
          <form className="comment-form" onSubmit={handleCreate}>
            <Avatar author={user} className="comment-avatar comment-composer-avatar" />
            <label className="visually-hidden" htmlFor="new-comment">
              Write a comment
            </label>
            <textarea
              disabled={posting}
              id="new-comment"
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="Write a comment..."
              rows="3"
              value={newComment}
            />
            <button className="button" disabled={posting} type="submit">
              {posting ? "Posting..." : "Send"}
            </button>
          </form>
        ) : (
          <p className="login-prompt comment-login-prompt">
            <Link to="/login">Log in</Link> to comment.
          </p>
        )}

        {actionMessage && (
          <p className="action-message action-success" role="status">
            {actionMessage}
          </p>
        )}
        {actionError && (
          <p className="action-message action-error" role="alert">
            {actionError}
          </p>
        )}

        <div className="comments-list" aria-live="polite">
          {commentsLoading && (
            <SkeletonLoader type="comments" />
          )}
          {!commentsLoading && commentsError && (
            <p className="comments-state comments-state-error" role="alert">
              {commentsError}
            </p>
          )}
          {!commentsLoading &&
            !commentsError &&
            comments.length === 0 && (
              <div className="empty-state empty-state-comments">
                <span className="empty-state-icon" aria-hidden="true">○</span>
                <strong>No comments yet</strong>
                <p>Start the conversation.</p>
              </div>
            )}

          {!commentsLoading &&
            !commentsError &&
            comments.map((comment) => {
              const isOwner =
                isAuthenticated &&
                Number(comment.author.id) === Number(user.id);
              const isEditing = editingId === comment.id;
              const isDeleting = deletingId === comment.id;

              return (
                <article
                  className={`comment-card${createdCommentId === comment.id ? " comment-created" : ""}`}
                  key={comment.id}
                >
                  <Avatar author={comment.author} className="comment-avatar" />
                  <div className="comment-body">
                    <header className="comment-header">
                      <div>
                        <Link
                          className="comment-author"
                          to={`/users/${comment.author.id}`}
                        >
                          {comment.author.name}
                        </Link>
                        <time dateTime={comment.created_at}>
                          {formatDate(comment.created_at)}
                        </time>
                      </div>
                      {isOwner && !isEditing && (
                        <div className="owner-actions comment-actions">
                          <button
                            className="text-button"
                            disabled={isDeleting}
                            onClick={() => startEditing(comment)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="text-button text-button-danger"
                            disabled={isDeleting}
                            onClick={() => handleDelete(comment.id)}
                            type="button"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </header>

                    {isEditing ? (
                      <form
                        className="comment-edit-form"
                        onSubmit={(event) => handleUpdate(event, comment)}
                      >
                        <textarea
                          aria-label="Comment content"
                          disabled={saving}
                          onChange={(event) => setEditContent(event.target.value)}
                          rows="3"
                          value={editContent}
                        />
                        <div className="edit-actions">
                          <button
                            className="button"
                            disabled={saving}
                            type="submit"
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            className="button button-secondary"
                            disabled={saving}
                            onClick={cancelEditing}
                            type="button"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p>{comment.content}</p>
                    )}
                  </div>
                </article>
              );
            })}
        </div>
      </section>
    </section>
  );
}

export default PostDetails;
