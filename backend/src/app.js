import express from "express"
import cors from "cors"
import usersRoutes from './routes/users.routes.js';
import formRoutes from './routes/form.routes.js';

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
)

// API Routes
app.use("/api", usersRoutes);
app.use("/api/form", formRoutes);

export default app