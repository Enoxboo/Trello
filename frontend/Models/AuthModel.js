// Définie les modèles de données pour l'authentification
export class LoginModel {
    constructor(email = "", password = "") {
        this.email = email;
        this.password = password;
    }
}

export class RegisterModel {
    constructor(username = "", email = "", password = "") {
        this.username = username;
        this.email = email;
        this.password = password;
    }
}