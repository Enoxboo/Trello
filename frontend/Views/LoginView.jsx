import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { LoginModel } from "../models/AuthModel";
import { loginService, saveTokens } from "../services/authService";
import "../style/login.css";
import yomoLogo from "../src/assets/yomologo.png";

export default function LoginView() {
    const [form, setForm] = useState(new LoginModel());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const result = await loginService(form);
            saveTokens(result.accessToken, result.refreshToken);
            navigate("/board");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page" aria-label="Page de connexion">
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
                        <p className="switch-text">
                            Pas encore de compte ?{" "}
                            <Link to="/register" className="switch-link">
                                S'inscrire
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </main>
    );
}
