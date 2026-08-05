import { useEffect, useRef, useState } from "react";
import SocialIcon from "./SocialIcon";

function PostActionsMenu({ deleting, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="post-menu" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Post actions"
        className="post-menu-trigger"
        disabled={deleting}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <SocialIcon name="more" />
      </button>
      {open && (
        <div className="post-menu-dropdown" role="menu">
          <button
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            role="menuitem"
            type="button"
          >
            Edit post
          </button>
          <button
            className="danger"
            disabled={deleting}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            role="menuitem"
            type="button"
          >
            {deleting ? "Deleting..." : "Delete post"}
          </button>
        </div>
      )}
    </div>
  );
}

export default PostActionsMenu;
