import { avecCache, purgerCache } from "../cache.js";
import type { Request, Response } from "express";

import {
    obtenirProduits,
    trouverProduit,
    ajouterProduit,
    remplacerProduit,
    supprimerProduit
} from "../models/produit.js";

import { validerProduit } from "../validation/produit.js";

export async function listeProduits(
    _req: Request,
    res: Response
): Promise<void> {
    const resultat = await avecCache(
        "produits",
        60,
        obtenirProduits
    );

    res.setHeader("X-Cache", resultat.cache);
    res.status(200).json(resultat.valeur);
}

export async function obtenirProduit(
    req: Request,
    res: Response
): Promise<void> {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ erreur: "ID invalide" });
        return;
    }

    const produit = await trouverProduit(id);

    if (!produit) {
        res.status(404).json({ erreur: "Produit introuvable" });
        return;
    }

    res.status(200).json(produit);
}

export async function creerProduit(
    req: Request,
    res: Response
): Promise<void> {
    const resultat = validerProduit(req.body);

    if (!resultat.valide) {
        res.status(400).json({
            erreur: "Données invalides",
            details: resultat.erreurs
        });
        return;
    }

    const produit = await ajouterProduit(resultat.donnees);

    await purgerCache("produits");

    res.status(201).json(produit);
}

export async function mettreAJourProduit(
    req: Request,
    res: Response
): Promise<void> {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ erreur: "ID invalide" });
        return;
    }

    const resultat = validerProduit(req.body);

    if (!resultat.valide) {
        res.status(400).json({
            erreur: "Données invalides",
            details: resultat.erreurs
        });
        return;
    }

    const produit = await remplacerProduit(id, resultat.donnees);

    if (!produit) {
        res.status(404).json({ erreur: "Produit introuvable" });
        return;
    }

    await purgerCache("produits");

    res.status(200).json(produit);
}

export async function supprimerUnProduit(
    req: Request,
    res: Response
): Promise<void> {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ erreur: "ID invalide" });
        return;
    }

    const supprime = await supprimerProduit(id);

    if (!supprime) {
        res.status(404).json({ erreur: "Produit introuvable" });
        return;
    }

    await purgerCache("produits");

    res.status(204).send();
}