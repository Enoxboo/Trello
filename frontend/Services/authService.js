// Permet de gérer les appels API liés à l'authentification
export async function loginService(loginData) {
    const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erreur de connexion");
    }

    return data;
}