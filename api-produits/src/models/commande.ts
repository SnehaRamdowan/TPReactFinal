import { pool } from "../db.js";

export class StockInsuffisantError extends Error {
    constructor() {
        super("Produit indisponible ou stock insuffisant");
        this.name = "StockInsuffisantError";
    }
}

export async function creerCommande(
    prenom: string,
    produitId: number,
    quantite: number
) {
    if (
        !prenom.trim() ||
        !Number.isInteger(produitId) ||
        produitId <= 0 ||
        !Number.isInteger(quantite) ||
        quantite <= 0
    ) {
        throw new Error("Données de commande invalides");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const resultatProduit = await client.query<{
            id: number;
            nom: string;
            prix: string;
            stock: number;
        }>(
            `UPDATE produits
             SET stock = stock - $1
             WHERE id = $2 AND stock >= $1
             RETURNING id, nom, prix, stock`,
            [quantite, produitId]
        );

        const produit = resultatProduit.rows[0];

        if (!produit) {
            throw new StockInsuffisantError();
        }

        const resultatCommande = await client.query<{
            id: number;
            prenom: string;
            produit_id: number;
            quantite: number;
            prix_unitaire: string;
            created_at: Date;
        }>(
            `INSERT INTO commandes
                (prenom, produit_id, quantite, prix_unitaire)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [prenom.trim(), produitId, quantite, produit.prix]
        );

        const commande = resultatCommande.rows[0]!;

        await client.query("COMMIT");

        return {
            ...commande,
            prix_unitaire: Number(commande.prix_unitaire),
            produit: produit.nom,
            stockRestant: produit.stock
        };
    } catch (erreur) {
        await client.query("ROLLBACK");
        throw erreur;
    } finally {
        client.release();
    }
}
export async function compterCommandes(): Promise<number> {
    const resultat = await pool.query<{ total: string }>(
        "SELECT COUNT(*) AS total FROM commandes"
    );

    return Number(resultat.rows[0]!.total);
}
export async function obtenirCommandes() {
    const resultat = await pool.query<{
        id: number;
        prenom: string;
        produit_id: number;
        produit: string;
        quantite: number;
        prix_unitaire: string;
        created_at: Date;
    }>(
        `SELECT
            c.id,
            c.prenom,
            c.produit_id,
            p.nom AS produit,
            c.quantite,
            c.prix_unitaire,
            c.created_at
         FROM commandes c
         JOIN produits p ON p.id = c.produit_id
         ORDER BY c.id DESC`
    );

    return resultat.rows.map(commande => ({
        ...commande,
        prix_unitaire: Number(commande.prix_unitaire)
    }));
}