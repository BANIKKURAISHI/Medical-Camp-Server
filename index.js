const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port =process.env.PORT||5000
const app = express()
app.use(express.json())
app.use(cors())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qpti930.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const adminAddCollection =client.db('Medical').collection('adminAdd')

    //// Post for new user 
    app.post('/adminAdd',async(req,res)=>{
        const add=req.body 
        const result =await adminAddCollection.insertOne(add)
        res.send(result)
        console.log(result)
    })
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  //  await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('I am trying to create my camp website')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })