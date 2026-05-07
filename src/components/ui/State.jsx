import { getErrorMessage } from "../../utils/errors";

export function FullPageStatus({ title, message }) {
  return (
    <div className="full-page-status">
      <div className="spinner" aria-hidden="true" />
      <h1>{title}</h1>
      {message && <p>{message}</p>}
    </div>
  );
}

export function LoadingState({ title = "Загрузка", message = "Получаем свежие данные." }) {
  return (
    <div className="state-box">
      <div className="spinner" aria-hidden="true" />
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}

export function EmptyState({ title, message }) {
  return (
    <div className="state-box">
      <h2>{title}</h2>
      {message && <p>{message}</p>}
    </div>
  );
}

export function ErrorState({ error, title = "Не удалось загрузить данные" }) {
  return (
    <div className="state-box state-box-error">
      <h2>{title}</h2>
      <p>{getErrorMessage(error)}</p>
    </div>
  );
}
