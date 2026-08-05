function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-row">
        <span className="skeleton-block skeleton-avatar" />
        <div className="skeleton-copy">
          <span className="skeleton-block skeleton-line skeleton-line-short" />
          <span className="skeleton-block skeleton-line skeleton-line-tiny" />
        </div>
      </div>
      <span className="skeleton-block skeleton-line" />
      <span className="skeleton-block skeleton-line skeleton-line-medium" />
      <span className="skeleton-block skeleton-media" />
    </div>
  );
}

function SkeletonLoader({ type = "feed" }) {
  if (type === "profile") {
    return (
      <div className="skeleton-profile" aria-label="Loading profile" role="status">
        <span className="skeleton-block skeleton-profile-avatar" />
        <div className="skeleton-copy">
          <span className="skeleton-block skeleton-line skeleton-line-medium" />
          <span className="skeleton-block skeleton-line" />
          <span className="skeleton-block skeleton-line skeleton-line-short" />
        </div>
        <span className="visually-hidden">Loading profile...</span>
      </div>
    );
  }

  if (type === "comments") {
    return (
      <div className="skeleton-comments" aria-label="Loading comments" role="status">
        <div className="skeleton-row">
          <span className="skeleton-block skeleton-avatar skeleton-avatar-small" />
          <div className="skeleton-copy">
            <span className="skeleton-block skeleton-line skeleton-line-short" />
            <span className="skeleton-block skeleton-line" />
          </div>
        </div>
        <div className="skeleton-row">
          <span className="skeleton-block skeleton-avatar skeleton-avatar-small" />
          <div className="skeleton-copy">
            <span className="skeleton-block skeleton-line skeleton-line-tiny" />
            <span className="skeleton-block skeleton-line skeleton-line-medium" />
          </div>
        </div>
        <span className="visually-hidden">Loading comments...</span>
      </div>
    );
  }

  return (
    <div className="skeleton-feed" aria-label="Loading posts" role="status">
      <SkeletonCard />
      <SkeletonCard />
      <span className="visually-hidden">Loading posts...</span>
    </div>
  );
}

export default SkeletonLoader;
