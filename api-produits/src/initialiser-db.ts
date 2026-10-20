import { readFile } from "node:fs/promises";
import { pool } from "./db.js";

async function initialiserBase(): Promise<void> {
    try {
        const chemin = new URL("../database.sql", import.meta.url);
        const sql = await readFile(chemin, "utf8");

        await pool.query(sql);

        console.log("Base de données initialisée.");
    } catch (erreur) {
        console.error(
            "Initialisation PostgreSQL impossible :",
            erreur instanceof Error ? erreur.message : erreur
        );

        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

void initialiserBase();