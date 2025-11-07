const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.port || 3000;

//middleware

app.use(cors());
app.use(express.json())

//smartdbUser
//th0Mjsq6rO2COPqB

const uri = "mongodb+srv://smartdbUser:th0Mjsq6rO2COPqB@cluster0.nry6rnt.mongodb.net/?appName=Cluster0";



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get("/",(req,res)=>{
    res.send("smart app server is running")
})



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

//create collection 
const db =client.db("smart_db")
const productsCollection=db.collection("products");


//get all products 
app.get('/products',async(req,res)=>{
  const cursor =productsCollection.find({});
   const result = await cursor.toArray();
   res.send(result);



})
//find a product 
app.get('/products/:id',async(req,res)=>{
  const id= req.params.id;
  const query={_id: new ObjectId(id)};
  const result= await productsCollection.findOne(query);
  res.send(result)


  

})

app.post('/products',async(req,res)=>{
    const newProduct= req.body;
    const result= await productsCollection.insertOne(newProduct);
    res.send(result);
    
})
// update the value 
app.patch('/products/:id',async(req,res)=>{
  const id=req.params.id;
  const updatedProduct= req.body;
  const query={_id: new ObjectId(id)}
  const update={
    $set:{
      name:updatedProduct.name,
      price:updatedProduct.price

    }
  }
  const result= await productsCollection.updateOne(query,update)
  res.send(result)


})





// delete the product ()
app.delete('/products/:id',async(req,res)=>{

  const id= req.params.id;
  const query={_id: new ObjectId(id)}
  const result =await productsCollection.deleteOne(query)
  res.send(result);
})












    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`smart server is running  on port ${port}`)
})