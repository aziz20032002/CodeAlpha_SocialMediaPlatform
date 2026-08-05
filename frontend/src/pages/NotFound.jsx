import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="not-found">
      <p className="not-found-code">404</p>
      <h1>Page not found</h1>
      <p className="page-intro">The page you are looking for does not exist or has been moved.</p>
      <Link className="button" to="/">Back to Home</Link>
    </section>
  );
}

export default NotFound;
