import { useEffect, useState } from "react";
import useAuth from "../context/useAuth";
import ImagePicker from "../components/ImagePicker";
import SkeletonLoader from "../components/SkeletonLoader";
import api from "../services/api";

const formatMemberSince = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

function ProfileAvatar({ profile }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = profile?.name?.trim()?.charAt(0)?.toUpperCase() || "?";

  if (!profile?.profile_image || imageFailed) {
    return (
      <span
        className="account-profile-avatar account-profile-placeholder"
        aria-hidden="true"
      >
        {initial}
      </span>
    );
  }

  return (
    <img
      alt={`${profile.name}'s profile`}
      className="account-profile-avatar"
      onError={() => setImageFailed(true)}
      src={profile.profile_image}
    />
  );
}

function Profile() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    profile_image: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileStats, setProfileStats] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/users/me", {
          signal: controller.signal,
        });
        setProfile(response.data);
        setForm({
          name: response.data.name || "",
          bio: response.data.bio || "",
          profile_image: response.data.profile_image || "",
        });

        const [followersResult, followingResult] = await Promise.allSettled([
          api.get(`/users/${response.data.id}/followers`, {
            signal: controller.signal,
          }),
          api.get(`/users/${response.data.id}/following`, {
            signal: controller.signal,
          }),
        ]);

        if (
          followersResult.status === "fulfilled" &&
          followingResult.status === "fulfilled"
        ) {
          setProfileStats({
            followers: Array.isArray(followersResult.value.data)
              ? followersResult.value.data.length
              : 0,
            following: Array.isArray(followingResult.value.data)
              ? followingResult.value.data.length
              : 0,
          });
        }
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
  }, []);

  const resetForm = () => {
    setForm({
      name: profile.name || "",
      bio: profile.bio || "",
      profile_image: profile.profile_image || "",
    });
  };

  const handleCancel = () => {
    resetForm();
    setProfileImageFile(null);
    setError("");
    setIsEditing(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const name = form.name.trim();

    if (!name) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", form.bio.trim());
      if (profileImageFile) {
        formData.append("profile_image", profileImageFile);
      } else if (form.profile_image.trim()) {
        formData.append("profile_image", form.profile_image.trim());
      }

      const response = await api.put("/users/me", formData);
      setProfile(response.data.user);
      setForm({
        name: response.data.user.name || "",
        bio: response.data.user.bio || "",
        profile_image: response.data.user.profile_image || "",
      });
      updateUser(response.data.user);
      setProfileImageFile(null);
      setIsEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="profile" />;
  }

  if (!profile) {
    return (
      <p className="feed-status feed-status-error" role="alert">
        {error || "Unable to load profile."}
      </p>
    );
  }

  return (
    <section>
      <h1 className="page-heading">Profile</h1>
      <p className="page-intro">
        Manage your personal information and public profile.
      </p>

      {success && (
        <p className="action-message action-success" role="status">
          {success}
        </p>
      )}
      {error && (
        <p className="action-message action-error" role="alert">
          {error}
        </p>
      )}

      <article className="account-profile-card">
        <ProfileAvatar
          key={`${profile.id}-${profile.profile_image}`}
          profile={profile}
        />

        <div className="account-profile-content">
          <div className="account-profile-heading">
            <div>
              <h2>{profile.name}</h2>
              <p className="account-profile-email">{profile.email}</p>
            </div>
            {!isEditing && (
              <button
                className="button"
                onClick={() => {
                  setSuccess("");
                  setError("");
                  setIsEditing(true);
                }}
                type="button"
              >
                Edit Profile
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="account-profile-details">
              <p>{profile.bio?.trim() || "No bio yet."}</p>
              {profile.created_at && (
                <span>
                  Member since {formatMemberSince(profile.created_at)}
                </span>
              )}
              {profileStats && (
                <div className="profile-stats" aria-label="Profile statistics">
                  <span>
                    <strong>{profileStats.followers}</strong> Followers
                  </span>
                  <span>
                    <strong>{profileStats.following}</strong> Following
                  </span>
                </div>
              )}
            </div>
          ) : (
            <form className="profile-edit-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="profile-name">Name</label>
                <input
                  disabled={saving}
                  id="profile-name"
                  name="name"
                  onChange={handleChange}
                  required
                  type="text"
                  value={form.name}
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  readOnly
                  type="email"
                  value={profile.email}
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-bio">Bio</label>
                <textarea
                  disabled={saving}
                  id="profile-bio"
                  name="bio"
                  onChange={handleChange}
                  rows="4"
                  value={form.bio}
                />
              </div>

              <div className="form-group profile-photo-field">
                <span className="form-label">Profile photo</span>
                <ImagePicker
                  disabled={saving}
                  file={profileImageFile}
                  label="Choose from your computer"
                  onChange={setProfileImageFile}
                />
                <small>JPG, PNG, GIF or WEBP. Maximum size: 5 MB.</small>
              </div>

              <div className="edit-actions">
                <button className="button" disabled={saving} type="submit">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  className="button button-secondary"
                  disabled={saving}
                  onClick={handleCancel}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </article>
    </section>
  );
}

export default Profile;
