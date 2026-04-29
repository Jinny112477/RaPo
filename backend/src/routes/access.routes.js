import { Router } from "express";
import {
  approveAccessRequest,
  createAccessRequest,
  saveAccessDraft,
  getAllAccessRequests,
  getAvailableRopa,
  getMyAccessRequests,
  getPendingAccessRequests,
  rejectAccessRequest,
  getAccessRequestById,
  updateAccessRequest,
  deleteAccessRequest,
} from "../controllers/access.controller.js";

const router = Router();

router.get("/available", getAvailableRopa);
router.get("/my-requests", getMyAccessRequests);
router.get("/pending", getPendingAccessRequests);
router.get("/", getAllAccessRequests);

router.post("/request", createAccessRequest);
router.post("/draft", saveAccessDraft);

router.patch("/:request_id/approve", approveAccessRequest);
router.patch("/:request_id/reject", rejectAccessRequest);

router.get("/:request_id", getAccessRequestById);
router.put("/:request_id", updateAccessRequest);
router.delete("/:request_id", deleteAccessRequest);

export default router;