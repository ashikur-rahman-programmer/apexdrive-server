const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 8000;

// mongodb connect
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.APEXDRIVE_DB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// middleware
app.use(cors());
app.use(express.json());

async function run() {
  try {
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );

    // create database
    const database = client.db("apexdrive_db");
    const carsCollection = database.collection("cars");

    // create api
    app.get("/cars", async (req, res) => {
      const allCars = await carsCollection.find().toArray();
      res.send(allCars);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server running!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
