import "dotenv/config";
import { gererErreurs } from "./middlewares/erreurs.js";
import express from "express";
import cors from "cors";
import routerProduits from "./routes/produit.js";
import routerCommandes from "./routes/commande.js";
import { verifierConnexion } from "./db.js";
import {
    ajouterVisite,
    obtenirVisites,
    obtenirCommandes,
    verifierRedis
} from "./cache.js";
import { compterCommandes } from "./models/commande.js";

const app = express();

const originesAutorisees = (
    process.env.CORS_ORIGIN ?? "http://localhost:5173,http://localhost:5174"
)
    .split(",")
    .map(origine => origine.trim())
    .filter(Boolean);

app.use(cors({
    origin(origine, callback) {
        const autorisee =
            !origine || originesAutorisees.includes(origine);

        callback(null, autorisee);
    },
    exposedHeaders: ["X-Cache"]
}));

app.use(express.json());

app.get("/api/health", async (_req, res) => {
    const connexionOK = await verifierConnexion();

    if (connexionOK) {
        res.status(200).json({ statut: "ok" });
    } else {
        res.status(503).json({ statut: "erreur" });
    }
});

app.get("/api/arch", async (_req, res) => {
    const [postgresOK, redisOK] = await Promise.all([
        verifierConnexion(),
        verifierRedis()
    ]);

    res.status(200).json({
        api: "ok",
        postgres: postgresOK ? "ok" : "indisponible",
        redis: redisOK ? "ok" : "indisponible",
        cacheTTL: 30
    });
});

app.use(
    ["/api/products", "/api/produits"],
    routerProduits
);

app.post(
    ["/api/visit", "/api/visites"],
    async (_req, res) => {
        const total = await ajouterVisite();
        res.status(200).json({ total });
    }
);

app.get(
    ["/api/visit", "/api/visites"],
    async (_req, res) => {
        const total = await obtenirVisites();
        res.status(200).json({ total });
    }
);

app.use("/api/orders", routerCommandes);

app.get("/api/stats", async (_req, res) => {
    const [visites, commandesRedis, commandesSQL] = await Promise.all([
        obtenirVisites().catch(() => null),
        obtenirCommandes(),
        compterCommandes()
    ]);

    res.status(200).json({
        visites,
        commandesRedis,
        commandesSQL
    });
});

app.use(gererErreurs);

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
    console.log(`API démarrée sur http://localhost:${PORT}`);
});