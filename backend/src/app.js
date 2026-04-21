import express from "express"
import cors from "cors"

// import Routes

const app = express()

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
)

// API Routes

app.use(express.json())

export default app