function normalizeErrorMessage(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeErrorMessage).filter(Boolean).join("; ");
  }

  if (typeof value === "object") {
    return (
      normalizeErrorMessage(value.message) ||
      normalizeErrorMessage(value.detail) ||
      normalizeErrorMessage(value.error) ||
      normalizeErrorMessage(value.msg) ||
      JSON.stringify(value)
    );
  }

  return String(value);
}

export function getErrorMessage(error, fallback = "Что-то пошло не так.") {
  return normalizeErrorMessage(
    error?.response?.data?.message ||
      error?.response?.data?.detail ||
      error?.message ||
      fallback,
  );
}
