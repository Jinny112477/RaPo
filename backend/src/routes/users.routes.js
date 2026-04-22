import { Router } from "express";
import { 
    createUsers, 
    getUsers 
} from "../controllers/users.controller.js";

const router = Router();

router.post("/users", createUsers); // POST: craete user profile
router.get("/users", getUsers); // GET: users profile and data

export default router;