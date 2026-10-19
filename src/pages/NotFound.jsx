import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="single-page">
      <section className="card not-found-card">
        <p className="not-found-code">404</p>
        <h2>Page Not Found</h2>
        <p className="skills-copy">
          The page you are looking for does not exist. Use the button below to return to the
          portfolio home page.
        </p>
        <Link className="home-link" to="/">
          Go Home
        </Link>
      </section>
    </main>
  );
}

export default NotFound;
