export function translateRole(role) {
  const labels = {
    admin: "Администратор",
    user: "Пользователь",
  };

  return labels[role] || role || "-";
}

export function translateSessionStatus(status) {
  const labels = {
    active: "Активна",
    completed: "Завершена",
    interrupted: "Прервана",
    pending: "Ожидает",
  };

  return labels[status] || status || "-";
}

export function translatePendingTransition(value) {
  const labels = {
    finish_candidate: "Возможно завершение",
    none: "Нет",
  };

  if (value === null || value === undefined || value === "") {
    return "Нет";
  }

  return labels[value] || String(value);
}
