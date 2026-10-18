import type { NouveauProduit } from "../models/produit.js";

export type ResultatValidation =
    | { valide: true; donnees: NouveauProduit }
    | { valide: false; erreurs: string[] };

export function validerProduit(corps: unknown): ResultatValidation {
    if (
        typeof corps !== "object" ||
        corps === null ||
        Array.isArray(corps)
    ) {
        return {
            valide: false,
            erreurs: ["Le corps doit être un objet"]
        };
    }

    const champs = corps as Record<string, unknown>;

    const nom = champs.nom;
    const prix = champs.prix;
    const stock = champs.stock;
    const categorie = champs.categorie;

    const erreurs: string[] = [];

    if (typeof nom !== "string" || nom.trim() === "") {
        erreurs.push("Le nom doit être un texte non vide");
    }

    if (
        typeof prix !== "number" ||
        !Number.isFinite(prix) ||
        prix <= 0
    ) {
        erreurs.push("Le prix doit être un nombre supérieur à 0");
    }

    if (
        typeof stock !== "number" ||
        !Number.isInteger(stock) ||
        stock < 0
    ) {
        erreurs.push("Le stock doit être un entier supérieur ou égal à 0");
    }

    if (typeof categorie !== "string" || categorie.trim() === "") {
        erreurs.push("La catégorie doit être un texte non vide");
    }

    if (
        typeof nom === "string" &&
        typeof prix === "number" &&
        typeof stock === "number" &&
        typeof categorie === "string" &&
        erreurs.length === 0
    ) {
        return {
            valide: true,
            donnees: {
                nom: nom.trim(),
                prix,
                stock,
                categorie: categorie.trim()
            }
        };
    }

    return {
        valide: false,
        erreurs
    };
}