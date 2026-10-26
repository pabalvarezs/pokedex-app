import { Router } from "express";
import * as adminController from "../controllers/admin";
import { requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAdmin);

router.get("/users", asyncHandler(adminController.listUsers));
router.post("/users", asyncHandler(adminController.createUser));
router.put("/users/:id", asyncHandler(adminController.updateUser));
router.delete("/users/:id", asyncHandler(adminController.deleteUser));

router.get("/favorites", asyncHandler(adminController.listFavorites));
router.post("/favorites", asyncHandler(adminController.createFavorite));
router.put("/favorites/:id", asyncHandler(adminController.updateFavorite));
router.delete("/favorites/:id", asyncHandler(adminController.deleteFavorite));

export default router;
