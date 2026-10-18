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