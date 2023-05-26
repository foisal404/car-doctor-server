const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
var jwt = require('jsonwebtoken');
const app=express();
const port=process.env.PORT || 5000;
//middleware
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send("doctor is running ...")
})


//mongodb



const uri = `mongodb+srv://${process.env.ENV_Name}:${process.env.ENV_Pass}@cluster0.pxrxjz6.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const verifyJWT=(req,res,next)=>{
  console.log("hiting jwt");
  // console.log(req.headers.authorization);
  const authorization=req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error: true,message :"Unauthorized Access"})
  }
  const token=authorization.split(' ')[1]
  // console.log("jwt token ",token);
  jwt.verify(token, process.env.Acces_Token_Secret, (err, decoded)=> {
    if(err){
      return res.status(403).send({error:true ,message:"Unauthorized Access"})
    }
    req.decoded=decoded;
    next()
  });
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const carDoctorDB = client.db("carDoctorDB");
    const servicesCollection = carDoctorDB.collection("servicesCollection");
    const bookings = carDoctorDB.collection("bookings");

    //jwt routes
    app.post('/jwt',(req,res)=>{
      const user=req.body;
      // console.log(user);
      const token=jwt.sign(user,process.env.Acces_Token_Secret, { expiresIn: '1h' })
      res.send({token})
    })

    //Services routes
    app.get('/services',async(req,res)=>{
        const cursor = servicesCollection.find();
        const result=await cursor.toArray();
        // console.log(result)
        res.send(result)
    })
    app.get('/services/:id',async(req,res)=>{
      const id=req.params.id;
      const query = { _id : new ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.send(result)
    })
    // Bookings Routes
    //for add 
    app.post('/bookings', async(req,res)=>{
      const data=req.body;
      const result = await bookings.insertOne(data);
      // console.log(data)
      res.send(result)

    })
    //for delete
    app.delete("/bookings/:id",async(req,res)=>{
      const id=req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookings.deleteOne(query);
      res.send(result)
    })
    // for read 
    app.get("/bookings",verifyJWT,async(req,res)=>{
      console.log("came back after verify");
      let query="";
      if(req.query){
        query=req.query
      }
      // console.log(query)
      const cursor = bookings.find(query);
      const result=await cursor.toArray();
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port,()=>{
    console.log(`doctor is running at port.... ${port}`)
})