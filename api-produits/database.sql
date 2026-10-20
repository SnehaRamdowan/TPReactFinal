CREATE TABLE produits (
                          id SERIAL PRIMARY KEY,
                          nom TEXT NOT NULL,
                          prix NUMERIC(10,2) NOT NULL,
                          stock INTEGER NOT NULL,
                          categorie TEXT NOT NULL
);

INSERT INTO produits (nom, prix, stock, categorie)
VALUES
    ('Laptop', 1200.00, 5, 'Informatique'),
    ('Souris', 25.00, 50, 'Accessoires'),
    ('Clavier', 75.00, 30, 'Accessoires');

CREATE TABLE IF NOT EXISTS commandes (
                                         id SERIAL PRIMARY KEY,
                                         prenom TEXT NOT NULL,
                                         produit_id INTEGER NOT NULL REFERENCES produits(id),
    quantite INTEGER NOT NULL CHECK (quantite > 0),
    prix_unitaire NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );