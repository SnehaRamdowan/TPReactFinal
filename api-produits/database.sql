BEGIN;

CREATE TABLE IF NOT EXISTS produits (
                                        id SERIAL PRIMARY KEY,
                                        nom TEXT NOT NULL,
                                        prix NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL,
    categorie TEXT NOT NULL
    );

CREATE TABLE IF NOT EXISTS commandes (
                                         id SERIAL PRIMARY KEY,
                                         prenom TEXT NOT NULL,
                                         produit_id INTEGER NOT NULL REFERENCES produits(id),
    quantite INTEGER NOT NULL CHECK (quantite > 0),
    prix_unitaire NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

-- Add starter products only when the products table is empty.
INSERT INTO produits (nom, prix, stock, categorie)
SELECT nom, prix, stock, categorie
FROM (
         VALUES
             ('Laptop', 1200.00, 5, 'Informatique'),
             ('Souris', 25.00, 50, 'Accessoires'),
             ('Clavier', 75.00, 30, 'Accessoires')
     ) AS exemples(nom, prix, stock, categorie)
WHERE NOT EXISTS (
    SELECT 1 FROM produits
);

COMMIT;