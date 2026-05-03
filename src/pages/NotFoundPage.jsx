import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="page-stack">
      <div className="state-box">
        <h1>Page not found</h1>
        <p>The requested monitoring view does not exist.</p>
        <Link className="button button-primary" to="/">
          Go to dashboard
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
