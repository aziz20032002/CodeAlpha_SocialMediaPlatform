import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import SocialIcon from "./SocialIcon";
import ThemeToggle from "./ThemeToggle";

function NavbarAvatar({ user }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "?";

  if (!user?.profile_image || imageFailed) {
    return <span className="nav-user-avatar nav-user-placeholder" aria-hidden="true">{initial}</span>;
  }

  return (
    <img
      alt={`${user.name}'s profile`}
      className="nav-user-avatar"
      onError={() => setImageFailed(true)}
      src={user.profile_image}
    />
  );
}

const navClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="mobile-header">
        <Link className="brand" to="/">
          <span className="brand-mark brand-mark-wide" aria-hidden="true">CA</span>
          <span>CodeAlpha Social</span>
        </Link>
        <div className="mobile-actions">
          <ThemeToggle />
          {isAuthenticated && user && (
            <Link aria-label="Open your profile" className="mobile-profile-link" to="/profile">
              <NavbarAvatar key={`mobile-${user.id}-${user.profile_image}`} user={user} />
            </Link>
          )}
        </div>
      </div>

      <div className="navbar-inner">
        <NavLink className="brand desktop-brand" to="/">
          <span className="brand-mark brand-mark-wide" aria-hidden="true">CA</span>
          <span>CodeAlpha Social</span>
        </NavLink>

        <nav className="nav-links" aria-label="Primary navigation">
          <NavLink className={navClass} end to="/">
            <SocialIcon className="nav-icon" name="home" />
            <span>Home</span>
          </NavLink>
          {isAuthenticated ? (
            <>
              <Link className="nav-link create-nav-link" to="/#create-post">
                <SocialIcon className="nav-icon" name="create" />
                <span>Create</span>
              </Link>
              <NavLink className={navClass} to="/profile">
                <SocialIcon className="nav-icon" name="profile" />
                <span>Profile</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink className={navClass} to="/login">
                <SocialIcon className="nav-icon" name="login" />
                <span>Login</span>
              </NavLink>
              <NavLink className={navClass} to="/register">
                <SocialIcon className="nav-icon" name="create" />
                <span>Register</span>
              </NavLink>
            </>
          )}
        </nav>

        <ThemeToggle />

        <aside className="sidebar-inspiration" aria-label="Community inspiration">
          <span className="sidebar-inspiration-orb sidebar-inspiration-orb-one" aria-hidden="true" />
          <span className="sidebar-inspiration-orb sidebar-inspiration-orb-two" aria-hidden="true" />
          <strong>Connect. Share. Discover.</strong>
          <p>Build meaningful connections and share what inspires you.</p>
        </aside>

        {isAuthenticated && user && (
          <div className="sidebar-user">
            <Link className="sidebar-user-profile" to="/profile">
              <NavbarAvatar key={`${user.id}-${user.profile_image}`} user={user} />
              <span>
                <strong>{user.name}</strong>
                <small>{user.email || "View profile"}</small>
              </span>
            </Link>
            <button className="sidebar-logout" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
