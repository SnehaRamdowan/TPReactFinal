import type {
    Request,
    Response,
    NextFunction
} from "express";

export function gererErreurs(
    erreur: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
): void {
    console.error(erreur);

    if (res.headersSent) {
        next(erreur);
        return;
    }

    const message = erreur instanceof Error
        ? erreur.message
        : "Erreur inconnue";

    const jsonInvalide =
        erreur instanceof SyntaxError &&
        "type" in erreur &&
        erreur.type === "entity.parse.failed";

    res.status(jsonInvalide ? 400 : 500).json({
        erreur: message
    });
}