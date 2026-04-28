import { Router } from "express";
import {
  createForm,
  deleteForm,
  fetchAllForms,
  fetchForm,
  submitRopaForm,
  updateForm,
} from "../controllers/form.controller.js";

const router = Router();

// old routes กัน frontend เดิมพัง
router.post("/submit", submitRopaForm);
router.get("/single", fetchForm);

// REST CRUD routes
router.post("/", createForm);
router.get("/", fetchAllForms);
router.get("/:activity_id", fetchForm);
router.put("/:activity_id", updateForm);
router.delete("/:activity_id", deleteForm);

export default router;