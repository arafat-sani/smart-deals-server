const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.port || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const db = client.db('UtilityBillsDb');
    const BillsCollection = db.collection('bills');
    const PaidBillsCollection = db.collection('paid-bills');

    console.log("✅ Connected to MongoDB");

    // GET all bills
    app.get('/bills', async (req, res) => {
      const bills = await BillsCollection.find().toArray();
      res.json(bills);
    });

// GET only 6 bills (no sorting)
app.get('/bills/limited/6', async (req, res) => {
  try {
    const bills = await BillsCollection.find().limit(6).toArray();
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch limited bills", error });
  }
});

    
    // GET bill by ID
    app.get('/bills/:id', async (req, res) => {
      try {
        const bill = await BillsCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!bill) return res.status(404).json({ message: "Bill not found" });
        res.json(bill);
      } catch (error) {
        res.status(500).json({ message: "Invalid ID", error });
      }
    });

    // POST paid bill
    app.post('/paid-bills', async (req, res) => {
      try {
        const paidBill = {
          ...req.body,
          createdAt: new Date()
        };
        const result = await PaidBillsCollection.insertOne(paidBill);
        res.status(201).json({ 
          message: "Payment recorded successfully", 
          insertedId: result.insertedId 
        });
      } catch (error) {
        res.status(500).json({ message: "Failed to record payment", error });
      }
    });

    // GET paid bills by email
    app.get('/paid-bills', async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) {
          return res.status(400).json({ message: "Email parameter is required" });
        }
        const bills = await PaidBillsCollection.find({ email }).toArray();
        res.json(bills);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch paid bills", error });
      }
    });

    // UPDATE paid bill by ID
    app.put('/paid-bills/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = req.body;
        
        const result = await PaidBillsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { ...updateData, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Bill not found" });
        }

        res.json({ message: "Bill updated successfully", result });
      } catch (error) {
        res.status(500).json({ message: "Failed to update bill", error });
      }
    });

    // DELETE paid bill by ID
    app.delete('/paid-bills/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        const result = await PaidBillsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Bill not found" });
        }

        res.json({ message: "Bill deleted successfully", result });
      } catch (error) {
        res.status(500).json({ message: "Failed to delete bill", error });
      }
    });

  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});