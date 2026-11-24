import { Router } from "express";
import * as dataCenterController from "../controllers/dataCenter";
import { requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// El Centro de Datos es interno: la misma verificación de rol que el panel de
// administración protege tanto la lectura como la actualización del caché.
router.use(requireAdmin);

// Rutas específicas antes que `/:category` para que no sean capturadas por él.
router.get("/pokemon/types", asyncHandler(dataCenterController.getPokemonTypes));
router.get("/:category/status", asyncHandler(dataCenterController.getCategoryStatus));
router.get("/:category", asyncHandler(dataCenterController.getCategory));
router.post("/:category/refresh", asyncHandler(dataCenterController.refreshCategory));

export default router;
