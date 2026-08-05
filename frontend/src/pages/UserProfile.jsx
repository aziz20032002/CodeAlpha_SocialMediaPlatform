import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useAuth from "../context/useAuth";
import SkeletonLoader from "../components/SkeletonLoader";
import api from "../services/api";

const formatJoinDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

function ProfileAvatar({ person, large = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = person?.name?.trim()?.charAt(0)?.toUpperCase() || "?";
  const className = `user-avatar${large ? " user-avatar-large" : ""}`;

  if (!person?.profile_image || imageFailed) {
    return (
      <span className={`${className} user-avatar-placeholder`} aria-hidden="true">
        {initial}
      </span>
    );
  }

  return (
    <img
      alt={`${person.name}'s profile`}
      className={className}
      onError={() => setImageFailed(true)}
      src={person.profile_image}
    />
  );
}

function UserList({ emptyMessage, title, users }) {
  return (
    <section className="user-list-card">
      <div className="user-list-heading">
        <h2>{title}</h2>
        <span>{users.length}</span>
      </div>

      {users.length === 0 ? (
        <p className="user-list-empty">{emptyMessage}</p>
      ) : (
        <ul className="user-list">
          {users.map((listUser) => (
            <li key={listUser.id}>
              <Link to={`/users/${listUser.id}`}>
                <ProfileAvatar key={`${listUser.id}-${listUser.profile_image}`} person={listUser} />
                <span className="user-list-copy">
                  <strong>{listUser.name}</strong>
                  <small>{listUser.bio?.trim() || "View community profile"}</small>
                </span>
                <span className="user-list-action">View profile</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function UserProfile() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followError, setFollowError] = useState("");
  const [updatingFollow, setUpdatingFollow] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");
        setFollowError("");
        setProfile(null);
        setFollowers([]);
        setFollowing([]);

        const [profileResponse, followersResponse, followingResponse] =
          await Promise.all([
            api.get(`/users/${id}`, { signal: controller.signal }),
            api.get(`/users/${id}/followers`, { signal: controller.signal }),
            api.get(`/users/${id}/following`, { signal: controller.signal }),
          ]);

        setProfile(profileResponse.data);
        setFollowers(followersResponse.data);
        setFollowing(followingResponse.data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err.response?.data?.message || "Unable to load profile.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => controller.abort();
  }, [id]);

  const isOwnProfile =
    Boolean(user && profile) && Number(user.id) === Number(profile.id);
  const isFollowing =
    Boolean(user) &&
    followers.some(
      (follower) => Number(follower.id) === Number(user.id),
    );

  const handleFollowToggle = async () => {
    if (!profile || !isAuthenticated || isOwnProfile) {
      return;
    }

    try {
      setUpdatingFollow(true);
      setFollowError("");

      if (isFollowing) {
        await api.delete(`/users/${profile.id}/follow`);
        setFollowers((currentFollowers) =>
          currentFollowers.filter(
            (follower) => Number(follower.id) !== Number(user.id),
          ),
        );
      } else {
        await api.post(`/users/${profile.id}/follow`);
        setFollowers((currentFollowers) => [
          ...currentFollowers,
          {
            id: user.id,
            name: user.name,
            bio: user.bio,
            profile_image: user.profile_image,
          },
        ]);
      }
    } catch (err) {
      setFollowError(
        err.response?.data?.message ||
          (isFollowing
            ? "Unable to unfollow user."
            : "Unable to follow user."),
      );
    } finally {
      setUpdatingFollow(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="profile" />;
  }

  if (error || !profile) {
    return (
      <p className="feed-status feed-status-error" role="alert">
        {error || "Unable to load profile."}
      </p>
    );
  }

  return (
    <section>
      <article className="public-profile-card" id="profile-overview">
        <ProfileAvatar
          key={`${profile.id}-${profile.profile_image}`}
          large
          person={profile}
        />

        <div className="public-profile-content">
          <div className="public-profile-title">
            <div>
              <h1>{profile.name}</h1>
              {profile.created_at && (
                <p className="profile-joined">
                  Joined {formatJoinDate(profile.created_at)}
                </p>
              )}
            </div>

            {isOwnProfile ? (
              <span className="own-profile-label">This is your profile.</span>
            ) : isAuthenticated ? (
              <button
                className={`button follow-button${isFollowing ? " button-secondary is-following" : ""}${updatingFollow ? " is-updating" : ""}`}
                disabled={updatingFollow}
                onClick={handleFollowToggle}
                type="button"
              >
                {updatingFollow
                  ? "Updating..."
                  : isFollowing
                    ? "Unfollow"
                    : "Follow"}
              </button>
            ) : (
              <Link className="button" to="/login">
                Log in to follow
              </Link>
            )}
          </div>

          <p className="public-profile-bio">
            {profile.bio?.trim() || "No bio yet."}
          </p>

          <div className="profile-stats" aria-label="Profile statistics">
            <span>
              <strong>{followers.length}</strong> Followers
            </span>
            <span>
              <strong>{following.length}</strong> Following
            </span>
          </div>

          {followError && (
            <p className="action-message action-error" role="alert">
              {followError}
            </p>
          )}
        </div>
      </article>

      <nav className="profile-tabs" aria-label="Profile sections">
        <a className="active" href="#profile-overview">Profile</a>
        <a href="#followers">Followers</a>
        <a href="#following">Following</a>
      </nav>

      <div className="profile-lists">
        <div id="followers">
          <UserList
            emptyMessage="No followers yet."
            title="Followers"
            users={followers}
          />
        </div>
        <div id="following">
          <UserList
            emptyMessage="Not following anyone yet."
            title="Following"
            users={following}
          />
        </div>
      </div>
    </section>
  );
}

export default UserProfile;
