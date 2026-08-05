import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../context/useAuth";
import api from "../services/api";

function FollowingAvatar({ person }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = person.name?.trim()?.charAt(0)?.toUpperCase() || "?";

  if (!person.profile_image || imageFailed) {
    return <span className="following-preview-avatar" aria-hidden="true">{initial}</span>;
  }

  return (
    <img
      alt={`${person.name}'s profile`}
      className="following-preview-avatar"
      loading="lazy"
      onError={() => setImageFailed(true)}
      src={person.profile_image}
    />
  );
}

function RightSidebar() {
  const { user, isAuthenticated } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);
  const [following, setFollowing] = useState([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    if (!isAuthenticated || !user?.id) {
      setFollowing([]);
      setFollowingCount(0);
      setFollowersCount(0);
      return () => controller.abort();
    }

    Promise.all([
      api.get(`/users/${user.id}/following`, { signal: controller.signal }),
      api.get(`/users/${user.id}/followers`, { signal: controller.signal }),
    ])
      .then(([followingResponse, followersResponse]) => {
        const followingUsers = Array.isArray(followingResponse.data)
          ? followingResponse.data
          : [];
        const followerUsers = Array.isArray(followersResponse.data)
          ? followersResponse.data
          : [];
        setFollowing(followingUsers.slice(0, 4));
        setFollowingCount(followingUsers.length);
        setFollowersCount(followerUsers.length);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFollowing([]);
          setFollowingCount(0);
          setFollowersCount(0);
        }
      });

    return () => controller.abort();
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const initial = user.name?.trim()?.charAt(0)?.toUpperCase() || "?";

  return (
    <aside className="right-sidebar" aria-label="Account summary">
      <div className="sidebar-profile-card">
        {!user.profile_image || imageFailed ? (
          <span className="sidebar-profile-avatar avatar-placeholder" aria-hidden="true">
            {initial}
          </span>
        ) : (
          <img
            alt={`${user.name}'s profile`}
            className="sidebar-profile-avatar"
            onError={() => setImageFailed(true)}
            src={user.profile_image}
          />
        )}
        <div>
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </div>
        <Link to="/profile">View profile</Link>
      </div>

      <div className="sidebar-stats" aria-label="Your social statistics">
        <div>
          <strong>{followersCount}</strong>
          <span>Followers</span>
        </div>
        <div>
          <strong>{followingCount}</strong>
          <span>Following</span>
        </div>
      </div>

      <div className="sidebar-note">
        <div className="sidebar-section-heading">
          <strong>People you follow</strong>
          <Link to={`/users/${user.id}`}>See all</Link>
        </div>
        {following.length ? (
          <div className="following-preview">
            {following.map((person) => (
              <Link className="following-preview-item" key={person.id} to={`/users/${person.id}`}>
                <FollowingAvatar key={`${person.id}-${person.profile_image}`} person={person} />
                <span>
                  <strong>{person.name}</strong>
                  <small>View profile</small>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p>Follow people to build your community.</p>
        )}
      </div>

      <p className="sidebar-meta">CodeAlpha Social · © 2026</p>
    </aside>
  );
}

export default RightSidebar;
