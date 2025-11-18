const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const db = client.db("UtilityBillsDb");
    const BillsCollection = db.collection("bills");
    const PaidBillsCollection = db.collection("paid-bills");

    console.log("MongoDB Connected ✔️");

    app.get("/", (req, res) => {
      res.send("Smart Deals Server Running ✔️");
    });

    app.get("/bills", async (req, res) => {
      const bills = await BillsCollection.find().toArray();
      res.json(bills);
    });

    app.get("/bills/limited/6", async (req, res) => {
      const bills = await BillsCollection.find().limit(6).toArray();
      res.json(bills);
    });

    app.get("/bills/:id", async (req, res) => {
      const bill = await BillsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.json(bill);
    });

    app.post("/paid-bills", async (req, res) => {
      const paidBill = { ...req.body, createdAt: new Date() };
      const result = await PaidBillsCollection.insertOne(paidBill);
      res.json(result);
    });

    app.get("/paid-bills", async (req, res) => {
      const email = req.query.email;
      const bills = await PaidBillsCollection.find({ email }).toArray();
      res.json(bills);
    });

    app.put("/paid-bills/:id", async (req, res) => {
      const result = await PaidBillsCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body }
      );
      res.json(result);
    });

    app.delete("/paid-bills/:id", async (req, res) => {
      const result = await PaidBillsCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.json(result);
    });

  } catch (error) {
    console.error(error);
  }
}

run();

// ❗ Vercel requires this (NO app.listen)
module.exports = app;
