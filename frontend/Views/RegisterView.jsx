import { useState } from "react";
import RegisterForm from "../Components/RegisterForm";
import { RegisterModel } from "../Models/AuthModel";
import "../style/login.css";
import yomoLogo from "../src/assets/yomologo.png";


// Composant de formulaire d'inscription
// Il affiche le formulaire,
export default function RegisterView() {
    const [form, setForm] = useState(new RegisterModel());
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
            console.log("Données envoyées :", form);
            setMessage("Inscription réussie");
        } catch (err) {
            setError("Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page" aria-label="Page d'inscription">
        <div className="login-page">
            <div className="login-wrapper">
                <div className="login-left">
                    <img src={yomoLogo} alt="Logo Yomo" className="login-logo" />
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

                        {message && <p className="success-message">{message}</p>}
                    </div>
                </div>
            </div>
        </div>
        </main>
    );
}