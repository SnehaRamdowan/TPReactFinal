import { Router } from "express";
import {
    passerCommande,
    listeCommandes
} from "../controllers/commandesController.js";

const routerCommandes = Router();

routerCommandes.get("/", listeCommandes);
routerCommandes.post("/", passerCommande);

export default routerCommandes;