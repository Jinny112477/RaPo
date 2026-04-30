import { Router } from "express";
import {
  approveRopa,
  getAllRopaForDpo,
  getPendingRopaForDpo,
  getRopaDetailForDpo,
  rejectRopa,
} from "../controllers/dpo.controller.js";

const router = Router();

router.get("/ropa/pending", getPendingRopaForDpo);
router.get("/ropa/:activity_id", getRopaDetailForDpo);
router.get("/ropa", getAllRopaForDpo);

router.patch("/ropa/:activity_id/approve", approveRopa);
router.patch("/ropa/:activity_id/reject", rejectRopa);

export default router;