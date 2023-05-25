const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
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

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const carDoctorDB = client.db("carDoctorDB");
    const servicesCollection = carDoctorDB.collection("servicesCollection");
    const bookings = carDoctorDB.collection("bookings");

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
    //for add 
    app.post('/bookings',async(req,res)=>{
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
    app.get("/bookings",async(req,res)=>{
      let query="";
      if(req.query){
        query=req.query
      }
      console.log(query)
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