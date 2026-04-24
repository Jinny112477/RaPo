import dotenv from "dotenv"
import http from "http"
import app from "./app.js"

dotenv.config()

const server = http.createServer(app)

const PORT = process.env.PORT || 5001

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})