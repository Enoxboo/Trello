// Définie les modèles de données pour l'authentification
export class LoginModel {
    constructor(email = "", password = "") {
        this.email = email;
        this.password = password;
    }
}