const express = require('express')
const app = express()

const ropaRoutes = require('./routes/ropa.routes')

app.use(express.json())
app.use('/api', ropaRoutes)

module.exports = app