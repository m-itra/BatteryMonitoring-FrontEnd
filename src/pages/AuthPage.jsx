import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../utils/errors";
import { FullPageStatus } from "../components/ui/State";

const initialLogin = {
  email: "",
  password: "",
};

const initialRegister = {
  name: "",
  email: "",
  password: "",
};

function AuthPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const redirectTo = location.state?.from?.pathname || "/";

  if (auth.isLoading) {
    return <FullPageStatus title="Восстановление сессии" message="Проверяем сохранённую сессию." />;
  }

  if (auth.user) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await auth.login(loginForm);
      await auth.meQuery.refetch();
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setError(getErrorMessage(loginError, "Не удалось войти."));
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    const credentials = {
      email: registerForm.email,
      password: registerForm.password,
    };

    try {
      await auth.register(registerForm);
    } catch (registerError) {
      setError(getErrorMessage(registerError, "Не удалось создать аккаунт."));
      return;
    }

    try {
      await auth.login(credentials);
      await auth.meQuery.refetch();
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setMode("login");
      setLoginForm({ email: credentials.email, password: "" });
      setRegisterForm(initialRegister);
      setMessage("Аккаунт создан, но автоматический вход не сработал. Войдите вручную.");
      setError(getErrorMessage(loginError, "Не удалось войти автоматически."));
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <span className="brand-mark" aria-hidden="true">
            BM
          </span>
          <h1>Мониторинг батареи</h1>
          <p>Безопасная аналитика устройств, сессий, циклов и состояния батарей.</p>
        </div>

        <div className="auth-card">
          <div className="segmented-control" role="tablist" aria-label="Режим авторизации">
            <button
              className={mode === "login" ? "active" : ""}
              type="button"
              onClick={() => setMode("login")}
            >
              Вход
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              type="button"
              onClick={() => setMode("register")}
            >
              Регистрация
            </button>
          </div>

          {message && <div className="notice notice-success">{message}</div>}
          {error && <div className="notice notice-error">{error}</div>}

          {mode === "login" ? (
            <form className="form-stack" onSubmit={handleLogin}>
              <label>
                Электронная почта
                <input
                  autoComplete="email"
                  name="email"
                  required
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>
              <label>
                Пароль
                <input
                  autoComplete="current-password"
                  name="password"
                  required
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, password: event.target.value }))
                  }
                />
              </label>
              <button className="button button-primary" disabled={auth.loginStatus.isPending} type="submit">
                {auth.loginStatus.isPending ? "Входим..." : "Войти"}
              </button>
            </form>
          ) : (
            <form className="form-stack" onSubmit={handleRegister}>
              <label>
                Имя
                <input
                  autoComplete="name"
                  name="name"
                  required
                  type="text"
                  value={registerForm.name}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </label>
              <label>
                Электронная почта
                <input
                  autoComplete="email"
                  name="email"
                  required
                  type="email"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>
              <label>
                Пароль
                <input
                  autoComplete="new-password"
                  minLength={6}
                  name="password"
                  required
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, password: event.target.value }))
                  }
                />
              </label>
              <button
                className="button button-primary"
                disabled={auth.registerStatus.isPending || auth.loginStatus.isPending}
                type="submit"
              >
                {auth.loginStatus.isPending
                  ? "Входим..."
                  : auth.registerStatus.isPending
                    ? "Создаём..."
                    : "Создать аккаунт"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
