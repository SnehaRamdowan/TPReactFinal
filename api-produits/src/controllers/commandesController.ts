import type { Request, Response } from "express";
import { purgerCache, ajouterCommande } from "../cache.js";
import {creerCommande, StockInsuffisantError, obtenirCommandes} from "../models/commande.js";

export async function passerCommande(
    req: Request,
    res: Response
): Promise<void> {
    const { prenom, produitId, quantite } = req.body ?? {};

    if (
        typeof prenom !== "string" ||
        !prenom.trim() ||
        prenom.trim().length > 100 ||
        typeof produitId !== "number" ||
        !Number.isInteger(produitId) ||
        produitId <= 0 ||
        produitId > 2147483647 ||
        typeof quantite !== "number" ||
        !Number.isInteger(quantite) ||
        quantite <= 0 ||
        quantite > 2147483647
    ) {
        res.status(400).json({
            erreur: "Prénom, produit ou quantité invalide"
        });
        return;
    }

    let commande;

    try {
        commande = await creerCommande(
            prenom,
            produitId,
            quantite
        );
    } catch (erreur) {
        if (erreur instanceof StockInsuffisantError) {
            res.status(409).json({
                erreur: erreur.message
            });
            return;
        }

        throw erreur;
    }

    await purgerCache("produits");

    await ajouterCommande();

    res.status(201).json({
        message: "Commande confirmée",
        commande
    });
}

export async function listeCommandes(
    _req: Request,
    res: Response
): Promise<void> {
    const commandes = await obtenirCommandes();
    res.status(200).json(commandes);
}