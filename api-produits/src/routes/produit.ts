import { Router } from "express";

import {
    listeProduits,
    obtenirProduit,
    creerProduit,
    mettreAJourProduit,
    supprimerUnProduit
} from "../controllers/produitsController.js";

const router = Router();

router.get("/", listeProduits);
router.get("/:id", obtenirProduit);
router.post("/", creerProduit);
router.put("/:id", mettreAJourProduit);
router.delete("/:id", supprimerUnProduit);

export default router;