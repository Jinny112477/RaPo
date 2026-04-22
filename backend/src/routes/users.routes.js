import { Router } from "express";
import { 
    createUsers, 
    deleteUser, 
    getUsers, 
    updateUser
} from "../controllers/users.controller.js";

const router = Router();

router.post("/users", createUsers); // POST: craete user profile
router.get("/users", getUsers); // GET: users profile and data
router.put("/users/:user_id", updateUser) // PUT: edit user
router.delete("/users/:user_id", deleteUser) // DELETE: delete user

export default router;