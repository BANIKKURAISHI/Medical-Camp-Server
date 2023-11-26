const express = require('express')
const cors = require('cors')
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const userCollection =client.db('Medical').collection('users')
    const jointCampCollection =client.db('Medical').collection('jointCamp')
////jwt 
app.post ('/jwt',async(req,res)=>{
  const body =req.body 
  const token =await jwt.sign(body, process.env.ACCESS_TOKEN,{
    expiresIn: "1h",
  })
  res.send({token})
  //console.log(token)
})
const verifyToken=(req,res,next)=>{
  if(!req.headers.authorization){
    res.status(401).send({ message: "Forbidden access" })
  }
  const token =req.headers.authorization.split(' ')[1]
  jwt.verify(token,process.env.ACCESS_TOKEN,(error,decoded)=>{
    if(error){
      return res.status(401).send({ message: "Forbidden access " });
    }
    req.decoded=decoded
    next();
  })
}





///user collection 
app.post('/user',async(req,res)=>{
  const user = req.body;
  const query ={email:user.email}
  const uniqEmail=await userCollection.findOne(query)
  if(uniqEmail){
    return res.send({ message: "Already exist", InsertedId: null })
  }
  query.name=user.name 
  query.photo=user.photo 
  const result =await userCollection.insertOne(query)
  res.send(result)
  
})
////join Camp 
app.post('/registration',async(req,res)=>{
  const add=req.body 
  const result =await jointCampCollection.insertOne(add)
  res.send(result)
 // console.log(result)
})
app.get('/registration',async(req,res)=>{
  const email=req?.query?.email 
  console.log(email)
  const query={email:email}
  const result =await jointCampCollection.find(query).toArray()
  res.send(result)
 // console.log(result)
})




    //// Post for new user 
    app.post('/adminAdd',async(req,res)=>{
        const add=req.body 
        const result =await adminAddCollection.insertOne(add)
        res.send(result)
        //console.log(result)
    })
    app.get('/manage-camps',async(req,res)=>{
      const result=await adminAddCollection.find().toArray()
      res.send(result)
    })
    app.get('/manage-camps/:id',async(req,res)=>{
      const id=req.params.id
      console.log (id)
      const query ={_id:new ObjectId(id)}
      const result =await adminAddCollection.findOne(query )
      res.send(result)
    })
   
    app.patch('/update-camp/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id:new ObjectId (id) };
      const update = req.body;
      const options = { upsert: true };
      const document ={
        $set:{
          campName:update.campName,
          image:update.image, 
          campFees:update.campFees,
          scheduledDate:update.scheduledDate,
          time:update.time,
          venue:update.venue,
          services :update.services ,
          attendance:update.attendance,
          targetAudience:update.targetAudience,
          description:update.description
        }
        
      }
      const result =await adminAddCollection.updateOne(query,document,options)
      res.send(result)
    })

    app.delete('/delete-camp/:id',async(req,res)=>{
      const id =req.params.id 
      const query ={_id:new ObjectId(id)}
      const result =await adminAddCollection.deleteOne(query)
      res.send(result)
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