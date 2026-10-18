import { gererErreurs } from "./middlewares/erreurs.js";
import express from "express";
import cors from "cors";
import routerProduits from "./routes/produit.js";
import { verifierConnexion } from "./db.js";
import { ajouterVisite, obtenirVisites } from "./cache.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
    const connexionOK = await verifierConnexion();

    if (connexionOK) {
        res.status(200).json({ statut: "ok" });
    } else {
        res.status(503).json({ statut: "erreur" });
    }
});

app.use("/api/produits", routerProduits);

app.post("/api/visites", async (_req, res) => {
    const total = await ajouterVisite();
    res.status(200).json({ total: total });
});

app.get("/api/visites", async (_req, res) => {
    const total = await obtenirVisites();
    res.status(200).json({ total: total });
});

app.use(gererErreurs);
const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
    console.log(`API démarrée sur http://localhost:${PORT}`);
});