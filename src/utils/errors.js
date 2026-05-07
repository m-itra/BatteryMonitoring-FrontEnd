export function getErrorMessage(error, fallback = "Что-то пошло не так.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    error?.message ||
    fallback
  );
}
