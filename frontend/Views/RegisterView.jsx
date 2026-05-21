import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RegisterForm from "../Components/RegisterForm";
import { RegisterModel } from "../Models/AuthModel";
import { registerService } from "../Services/authService";
import "../style/login.css";
import yomoLogo from "../src/assets/yomologo.png";

export default function RegisterView() {
    const [form, setForm] = useState(new RegisterModel());
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
            await registerService(form);
            navigate("/boards");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page" aria-label="Page d'inscription">
            <div className="login-wrapper">
                <div className="login-left">
                    <img src={yomoLogo} alt="Logo Yello" className="login-logo" />
                </div>
                <div className="login-right">
                    <div className="login-card">
                        <h1 className="login-title">Inscription</h1>
                        <p className="login-subtitle">
                            Créez votre compte sur <span className="spanYello">Yello</span>
                        </p>
                        <RegisterForm
                            form={form}
                            onChange={handleChange}
                            onSubmit={handleSubmit}
                            loading={loading}
                            error={error}
                        />
                        <p className="switch-text">
                            Déjà un compte ?{" "}
                            <Link to="/login" className="switch-link">Se connecter</Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
