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
    return <FullPageStatus title="Restoring session" message="Checking your saved session." />;
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
      setError(getErrorMessage(loginError, "Could not sign in."));
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await auth.register(registerForm);
      setMode("login");
      setLoginForm((current) => ({ ...current, email: registerForm.email }));
      setRegisterForm(initialRegister);
      setMessage("Account created. Sign in with your new credentials.");
    } catch (registerError) {
      setError(getErrorMessage(registerError, "Could not create account."));
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <span className="brand-mark" aria-hidden="true">
            BM
          </span>
          <h1>Battery Monitoring</h1>
          <p>Secure battery analytics for devices, sessions, cycles, and fleet health.</p>
        </div>

        <div className="auth-card">
          <div className="segmented-control" role="tablist" aria-label="Authentication mode">
            <button
              className={mode === "login" ? "active" : ""}
              type="button"
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              type="button"
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          {message && <div className="notice notice-success">{message}</div>}
          {error && <div className="notice notice-error">{error}</div>}

          {mode === "login" ? (
            <form className="form-stack" onSubmit={handleLogin}>
              <label>
                Email
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
                Password
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
                {auth.loginStatus.isPending ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : (
            <form className="form-stack" onSubmit={handleRegister}>
              <label>
                Name
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
                Email
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
                Password
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
                disabled={auth.registerStatus.isPending}
                type="submit"
              >
                {auth.registerStatus.isPending ? "Creating..." : "Create account"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
