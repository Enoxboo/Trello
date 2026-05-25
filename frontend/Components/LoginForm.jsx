// Composant de formulaire de connexion
// Ce composant affiche un formulaire de connexion avec des champs pour l'email et le mot de passe, ainsi qu'un bouton de soumission. 
// Il gère également les erreurs et l'état de chargement.
// Permet de réutiliser le formulaire de connexion dans différentes vues ou contextes de l'application.
export default function LoginForm({
                                      form,
                                      onChange,
                                      onSubmit,
                                      loading,
                                      error,
                                  }) {
    return (
        <form className="login-form" onSubmit={onSubmit}>
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
                {loading ? "Connexion..." : "Se connecter"}
            </button>
        </form>
    );
}