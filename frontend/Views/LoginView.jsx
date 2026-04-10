import { useState } from "react";
import LoginForm from "../components/LoginForm";
import { LoginModel } from "../models/AuthModel";
import { loginService } from "../services/authService";
import "../style/login.css";
import yomoLogo from "../src/assets/yomologo.png";

// Composant principal de la page de connexion
// Gère l'état du formulaire, les messages d'erreur et de succès, et l'appel au service de connexion
// Affiche le formulaire de connexion et les éléments visuels associés
// Utilise le service de connexion pour authentifier l'utilisateur et afficher les résultats
export default function LoginView() {
    const [form, setForm] = useState(new LoginModel());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const result = await loginService(form);
            setMessage(result.message || "Connexion réussie");
            console.log("Token reçu :", result.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-wrapper">
                <div className="login-left">
                    <img src={yomoLogo} alt="Logo Yomo" className="login-logo" />
                </div>

                <div className="login-right">
                    <div className="login-card">
                        <h1 className="login-title">Connexion</h1>
                        <p className="login-subtitle">
                            Bienvenue sur <span className="spanYello">Yello</span>
                        </p>

                        <LoginForm
                            form={form}
                            onChange={handleChange}
                            onSubmit={handleSubmit}
                            loading={loading}
                            error={error}
                        />

                        {message && <p className="success-message">{message}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}