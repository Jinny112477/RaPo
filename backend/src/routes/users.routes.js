import { Router } from "express";
import { 
    changePassword,
    createUsers, 
    deleteUser, 
    getMe, 
    getUsers, 
    updateUser
} from "../controllers/users.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/users", createUsers); // POST: craete user profile
router.get("/users", getUsers); // GET: users profile and data
router.put("/users/:user_id", updateUser); // PUT: edit user
router.delete("/users/:user_id", deleteUser); // DELETE: delete user
router.put("/change-password", verifyToken, changePassword); // PUT: change password
router.get("/me", verifyToken, getMe); // GET: Profiles

export default router;