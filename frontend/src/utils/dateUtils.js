// Fonction pour déterminer le statut de la date d'échéance
// Elle retourne "overdue" si la date est passée, "soon" si elle est dans les 2 prochains jours, et "ok" sinon
// Si aucune date n'est définie, elle retourne null
export function getDueDateStatus(dueDate) {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    const diff = (due - today) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "overdue";
    if (diff <= 2) return "soon";
    return "ok";
}

export function formatDate(dueDate) {
    const d = new Date(dueDate);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}