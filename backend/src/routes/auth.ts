import { Router } from "express";
import * as authController from "../controllers/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/login", asyncHandler(authController.login));
router.get("/credentials", authController.getCredentialsInfo);

export default router;
