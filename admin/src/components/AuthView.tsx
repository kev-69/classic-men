import type { Dispatch, FormEvent, SetStateAction } from "react";

type AuthViewProps = {
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  statusMessage: string;
  onLogin: (event: FormEvent) => void;
};

export function AuthView({ password, setPassword, isLoading, statusMessage, onLogin }: AuthViewProps) {
  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={onLogin}>
        <p className="eyebrow">Classic-Men</p>
        <h1>Admin Dashboard</h1>
        <p>Use your admin password to manage products and contact messages.</p>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter admin password"
            required
          />
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Login"}
        </button>
        <small>{statusMessage}</small>
      </form>
    </main>
  );
}
