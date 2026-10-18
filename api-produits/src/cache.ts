import "dotenv/config";
import { createClient } from "redis";

const client = createClient({
    url: process.env.REDIS_URL,
    disableOfflineQueue: true
});

client.on("error", (erreur: Error) => {
    console.warn("Redis indisponible :", erreur.message);
});

await client.connect();

export type SourceCache = "hit" | "miss" | "bypass";

export async function lireCache<T>(
    cle: string
): Promise<T | null> {
    const texte = await client.get(cle);

    if (texte === null) {
        return null;
    }

    return JSON.parse(texte) as T;
}

export async function mettreEnCache<T>(
    cle: string,
    valeur: T,
    ttlSec: number = 60
): Promise<void> {
    await client.setEx(
        cle,
        ttlSec,
        JSON.stringify(valeur)
    );
}

export async function purgerCache(
    cle: string
): Promise<void> {
    if (!client.isReady) {
        console.warn("Redis indisponible : cache non purgé");
        return;
    }

    try {
        await client.del(cle);
    } catch {
        console.warn("Impossible de purger le cache Redis");
    }
}

export async function avecCache<T>(
    cle: string,
    ttlSec: number,
    charger: () => Promise<T>
): Promise<{ valeur: T; cache: SourceCache }> {
    if (!client.isReady) {
        console.warn("Redis indisponible : lecture depuis PostgreSQL");

        const valeur = await charger();

        return {
            valeur,
            cache: "bypass"
        };
    }

    try {
        const valeurCache = await lireCache<T>(cle);

        if (valeurCache !== null) {
            return {
                valeur: valeurCache,
                cache: "hit"
            };
        }
    } catch {
        console.warn("Lecture Redis impossible : utilisation de PostgreSQL");

        const valeur = await charger();

        return {
            valeur,
            cache: "bypass"
        };
    }

    const valeur = await charger();

    try {
        await mettreEnCache(cle, valeur, ttlSec);

        return {
            valeur,
            cache: "miss"
        };
    } catch {
        console.warn("Enregistrement Redis impossible");

        return {
            valeur,
            cache: "bypass"
        };
    }
}

export async function ajouterVisite(): Promise<number> {
    const total = await client.incr("visites");
    return total;
}

export async function obtenirVisites(): Promise<number> {
    const total = await client.get("visites");
    return Number(total ?? 0);
}