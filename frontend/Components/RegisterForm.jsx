import { Link } from "react-router-dom";

export default function RegisterForm({
  form,
  onChange,
  onSubmit,
  loading,
  error,
}) {
  return (
    <form className="login-form" onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="username">Nom d'utilisateur</label>
        <input
          id="username"
          name="username"
          type="text"
          value={form.username}
          onChange={onChange}
          placeholder="Patrick"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="email@example.com"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="••••••••"
          required
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      <button type="submit" className="login-button" disabled={loading}>
        {loading ? "Inscription..." : "S'inscrire"}
      </button>

      <p className="switch-text">
        Déjà membre ?{" "}
        <Link to="/login" className="switch-link">
          Se connecter
        </Link>
      </p>
    </form>
  );
}