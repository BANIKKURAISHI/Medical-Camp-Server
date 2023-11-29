const express = require('express')
const cors = require('cors')
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
    const CampPaymentCollection =client.db('Medical').collection('campPayment')
    const reviewCollection =client.db('Medical').collection('review')
    const teamCollection =client.db('Medical').collection('Team')
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
  //console.log(req?.headers?.authorizationS)
  if(!req?.headers?.authorization){
    res.status(401).send({ message: "Forbidden access" })
  }
  const token =req?.headers?.authorization?.split(' ')[1]
  jwt.verify(token,process.env.ACCESS_TOKEN,(error,decoded)=>{
    if(error){
      return res.status(403).send({ message: "Forbidden access " });
    }
    req.decoded=decoded
    next();
  })
}








    app.get("/user/admin/:email", verifyToken,async (req, res) => {
      const email = req?.params?.email;
      if (!email === req?.decoded?.email) {
        return res.status(403).send({ message: "unauthorized access " });
      }
      const query = { email: email };
      const result = await userCollection.findOne(query);
      let admin = false;
      if (result) {
        admin = result?.role === "admin";
      }
      res.send({ admin });
    });

    // app.patch('/Part-profile/:id',verifyToken,async(req,res)=>{
    //   const id=req.params.id 
    //   const query ={_id:new ObjectId(id)}
    //   const update={
    //     $set:{
    //       number:
    //     }
    //   }
    //   const result =await userCollection.updateOne(query,update)
    //   res.send(result)
    // })





const verifyAdmin=async(req,res,next)=>{
  const email = req?.decoded?.email;
  const query = { email: email };
  const user =await userCollection.findOne(query)
  const admin=user?.role==="admin"
  if(admin){
    return res.status(403).send({ message: "unauthorized access " });
  }
  next()

}





///user collection work /////////////////////////////////////////////////////////////
app.get('/organizer-profile',async(req,res)=>{
 
  const result =await userCollection.find().toArray()
  res.send(result)
  //console.log(result)
})

app.get('/organizer/user/:email',async(req,res)=>{
  const email=req.params.email
  const query={email:email}
  const result =await userCollection.findOne(query)
  res.send(result)
  //console.log(result)
})
//

app.get('/organizer-profile/:id',async(req,res)=>{
   const id=req.params.id 
   const query={_id:new ObjectId(id)}
  const result =await userCollection.findOne(query)
  res.send(result)
  //console.log(result)
})

app.patch('/userUpdate/:id',async(req,res)=>{
  const id=req.params.id 
   const query={_id:new ObjectId(id)}
   const body=req.body
   options={upsert:true}
   const update={
    $set:{
     number:update.number
    }
   }
   const result =await userCollection.updateOne(query,update,option)
   res.send(result)
})


app.delete('/organizer-profile/delete/:id',async(req,res)=>{
  const id=req.params.id 
  const query={_id:new ObjectId(id)}
 const result =await userCollection.deleteOne(query)
 res.send(result)
 //console.log(result)
})
////////////////////////////////////get a team////////////
app.get('/team',async(req,res)=>{
  const result =await teamCollection.find().toArray()
  res.send(result)
})


app.patch('/organizer-profile/admin/:id',verifyToken,async(req,res)=>{
  const id=req.params.id 
  const query ={_id:new ObjectId(id)}
  const update={
    $set:{
      role:"admin"
    }
  }
  const result =await userCollection.updateOne(query,update)
  res.send(result)
})


app.post('/user',async(req,res)=>{
  const user = req.body;
  const query ={email:user.email}
  const uniqEmail=await userCollection.findOne(query)
  if(uniqEmail){
    return res.send({ message: "Already exist", InsertedId: null })
  }
  query.name=user.name 
  query.photo=user.photo 
  query.post=user.post 
  const result =await userCollection.insertOne(query)
  res.send(result)
  
})
////join Camp  work //////////////////////////////////////////////////////////////////////////////
app.post('/registration',async(req,res)=>{
  const add=req.body 
  const result =await jointCampCollection.insertOne(add)
  res.send(result)
 // console.log(result)
})

//////////////////paid camp gate 
app.get('/paid',async(req,res)=>{
  const email=req?.query?.email 
  console.log(email)
  const query={email:email}
  const result =await CampPaymentCollection.find(query).toArray()
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
app.get('/registration/:id',async(req,res)=>{
  const id=req.params.id
 // console.log (id)
  const query ={_id:new ObjectId(id)}
  const result =await jointCampCollection.findOne(query )
  res.send(result)
})
//  app.delete('/delete-registration/:id',async(req,res)=>{
//    const id =req.params.id 
//    const query ={_id:new ObjectId(id)}
//    const result =await adminAddCollection.deleteOne(query)
//    res.send(result)
//  })

//get 6 id which 
app.get('/bestCamps',async(req,res)=>{
  // const filter =req.query 
  // const query={full_description:}
   const result =await adminAddCollection.find().sort({ attendance:-1}).limit(6).toArray()
   res.send(result)
 
 })
 ///// update only attendence
 app.patch('/update/:id',async(req,res)=>{
  const id = req.params.id;
  const query = { _id:new ObjectId (id) };
  const update = req.body;
  const options = { upsert: true };
  const document ={
    $set:{
     
      attendance:update.attendance,
    
    }
    
  }
  const result =await adminAddCollection.updateOne(query,document,options)
  res.send(result)
})
/////////////////////Camp payment 
 app.get('/campRegistration',async(req,res)=>{
 const result=await CampPaymentCollection.find().toArray()
 res.send(result)
 })
 app.get('/campRegistration/:id',async(req,res)=>{
  const id=req.params.id 
  const query ={_id:new ObjectId(id)}
  const result=await CampPaymentCollection.findOne(query)
 
  res.send(result)

  })

////////////////////////////////feedBack///////////////////////////////////
app.post('/feedback-and-ratings',async(req,res)=>{
  const feed=req.body 
  const result =await reviewCollection.insertOne(feed)
  res.send(result)
})
app.get('/feedback-and-rating',async(req,res)=>{
  const result=await reviewCollection.find().toArray()
  res.send(result)
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
     // console.log (id)
      const query ={_id:new ObjectId(id)}
      const result =await adminAddCollection.findOne(query )
      res.send(result)
    })
   
    app.patch('/update-camp/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id:new ObjectId (id) };
      const update = req.body;
      const updateDoc={
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
      if(!updateDoc.image){
        delete updateDoc.image
      }
      const options = { upsert: true };
      const document ={
        $set:updateDoc
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

    ////payment item post 
    app.post('/payment',async(req,res)=>{
      const id=req.body 
      const paymentResult =await CampPaymentCollection.insertOne(id)
     res.send(paymentResult)
    })

    app.patch('/updateCamp/:id',async(req,res)=>{
      const id=req.params.id
      const query={_id:new ObjectId(id)}
      const update=req.body 
      const updateDoc={
        $set:{
          paymentStatus:update. paymentStatus,
          confirmStatus:update.confirmStatus
        }
      }
      const result =await jointCampCollection.updateOne(query,updateDoc)
      res.send(result)
    })

    app.delete('/registration-cancel/:id',async(req,res)=>{
      const id =req.params.id 
      const query ={_id:new ObjectId(id)}
      const result =await jointCampCollection.deleteOne(query)
      res.send(result)
    })




    ////////////payment method /////////////////////
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
     console.log(paymentIntent.client_secret)
      res.send({
       clientSecret: paymentIntent?.client_secret,
      });
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