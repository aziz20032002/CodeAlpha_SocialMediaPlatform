import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import api from "../services/api";
import SocialIcon from "./SocialIcon";

function LikeButton({ postId }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadLikes = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/posts/${postId}/likes`, {
          signal: controller.signal,
        });
        const users = Array.isArray(response.data.users)
          ? response.data.users
          : [];

        setCount(Math.max(0, Number(response.data.count) || 0));
        setLiked(
          Boolean(user) &&
            users.some(
              (likeUser) => Number(likeUser.id) === Number(user.id),
            ),
        );
      } catch {
        if (!controller.signal.aborted) {
          setError("Unable to load likes.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadLikes();
    return () => controller.abort();
  }, [postId, user]);

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setUpdating(true);
      setError("");

      if (liked) {
        await api.delete(`/posts/${postId}/like`);
        setLiked(false);
        setCount((currentCount) => Math.max(0, currentCount - 1));
      } else {
        await api.post(`/posts/${postId}/like`);
        setLiked(true);
        setCount((currentCount) => currentCount + 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update like.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="like-control">
      <button
        aria-pressed={liked}
        className={`like-button${liked ? " liked" : ""}`}
        disabled={loading || updating}
        onClick={handleLikeToggle}
        type="button"
      >
        <SocialIcon filled={liked} name="like" />
        <span>{loading ? "Loading" : liked ? "Unlike" : "Like"}</span>
      </button>
      <span className="like-count" aria-label={`${count} likes`}>
        {count} {count === 1 ? "like" : "likes"}
      </span>
      {error && (
        <span className="like-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default LikeButton;
