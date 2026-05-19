const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 8000;

// mongodb connect
const { MongoClient, ServerApiVersion } = require("mongodb");
const { type } = require("node:os");

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
      // search r sort
      const { search, carType } = req.query;
      let query = {};
      //search
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      //sort
      if (type && type !== "All") {
        query.carType = type;
      }

      const allCars = await carsCollection.find(query).toArray();
      res.send(allCars);
    });

    // carTypes api
    app.get("/car-types", async (req, res) => {
      const result = await carsCollection
        .aggregate([
          {
            $group: { _id: "$carType" },
          },
          {
            $match: { _id: { $ne: null } },
          },
        ])
        .toArray();

      const carTypes = result.map((car) => car._id);
      res.send(carTypes);
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
