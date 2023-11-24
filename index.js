const express = require('express')
const cors = require('cors')
//todo:mongodb
require('dotenv').config()
const port =process.env.PORT||5000
const app = express()
app.use(express.json())
app.use(cors())






app.get('/', (req, res) => {
    res.send('I am trying to create my camp website')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })