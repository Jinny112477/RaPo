import { Router } from "express";
import {
  approveAccessRequest,
  createAccessRequest,
  getAllAccessRequests,
  getAvailableRopa,
  getMyAccessRequests,
  getPendingAccessRequests,
  rejectAccessRequest,
} from "../controllers/access.controller.js";

const router = Router();

router.get("/available", getAvailableRopa);
router.get("/my-requests", getMyAccessRequests);
router.get("/pending", getPendingAccessRequests);
router.get("/", getAllAccessRequests);

router.post("/request", createAccessRequest);

router.patch("/:request_id/approve", approveAccessRequest);
router.patch("/:request_id/reject", rejectAccessRequest);

export default router;