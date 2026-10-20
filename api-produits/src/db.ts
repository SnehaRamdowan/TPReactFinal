import "dotenv/config";
import { Pool } from "pg";

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000
});

pool.on("error", (erreur: Error) => {
    console.warn(
        "Connexion PostgreSQL interrompue :",
        erreur.message
    );
});

export async function verifierConnexion(): Promise<boolean> {
    try {
        await pool.query("SELECT 1");
        return true;
    } catch {
        return false;
    }
}