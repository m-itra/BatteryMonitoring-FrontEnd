import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="page-stack">
      <div className="state-box">
        <h1>Страница не найдена</h1>
        <p>Запрошенный экран мониторинга не существует.</p>
        <Link className="button button-primary" to="/">
          Перейти к обзору
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
