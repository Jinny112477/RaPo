const express = require('express')
const router = express.Router()

const rapoController = require('../controllers/ropa.controller')

router.get('/rapo', (req, res) => {
    console.log("rapo route called")
    res.json({ message: "working" })
})
module.exports = router