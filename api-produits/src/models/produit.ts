import { pool } from "../db.js";

export interface Produit {
    id: number;
    nom: string;
    prix: number;
    stock: number;
    categorie: string;
}

export type NouveauProduit = Omit<Produit, "id">;

export async function obtenirProduits(): Promise<Produit[]> {
    const resultat = await pool.query<Omit<Produit, "prix"> & { prix: string }>(
        "SELECT id, nom, prix, stock, categorie FROM produits ORDER BY id"
    );

    return resultat.rows.map(produit => ({
        ...produit,
        prix: Number(produit.prix)
    }));

}

export async function trouverProduit(
    id: number
): Promise<Produit | undefined> {
    const resultat = await pool.query<
        Omit<Produit, "prix"> & { prix: string }
    >(
        "SELECT id, nom, prix, stock, categorie FROM produits WHERE id = $1",
        [id]
    );

    const produit = resultat.rows[0];

    if (!produit) {
        return undefined;
    }

    return {
        ...produit,
        prix: Number(produit.prix)
    };
}

export async function ajouterProduit(
    donnees: NouveauProduit
): Promise<Produit> {
    const resultat = await pool.query<
        Omit<Produit, "prix"> & { prix: string }
    >(
        `INSERT INTO produits (nom, prix, stock, categorie)
         VALUES ($1, $2, $3, $4)
         RETURNING id, nom, prix, stock, categorie`,
        [donnees.nom, donnees.prix, donnees.stock, donnees.categorie]
    );

    const produit = resultat.rows[0]!;

    return {
        ...produit,
        prix: Number(produit.prix)
    };
}

export async function remplacerProduit(
    id: number,
    donnees: NouveauProduit
): Promise<Produit | undefined> {
    const resultat = await pool.query<
        Omit<Produit, "prix"> & { prix: string }
    >(
        `UPDATE produits
         SET nom = $1, prix = $2, stock = $3, categorie = $4
         WHERE id = $5
         RETURNING id, nom, prix, stock, categorie`,
        [donnees.nom, donnees.prix, donnees.stock, donnees.categorie, id]
    );

    const produit = resultat.rows[0];

    if (!produit) {
        return undefined;
    }

    return {
        ...produit,
        prix: Number(produit.prix)
    };
}

export async function supprimerProduit(id: number): Promise<boolean> {
    const resultat = await pool.query(
        "DELETE FROM produits WHERE id = $1",
        [id]
    );

    return (resultat.rowCount ?? 0) > 0;
}