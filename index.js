const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 8000;

// mongodb connect
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const bookingCollection = database.collection("bookings");

    // booking api
    app.get("/bookings", async (req, res) => {
      const query = req.body;
      const result = await bookingCollection.insertOne(query);
      res.send(result);
    });

    // create api
    app.get("/cars", async (req, res) => {
      // search r sort
      const { search, type } = req.query;
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

    // specific user cars card add api
    app.get("/my-cars", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await carsCollection.find(query).toArray();
      res.send(result);
    });

    // page details
    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.findOne(query);
      res.send(result);
    });

    // post
    app.post("/cars", async (req, res) => {
      const car = req.body;
      const result = await carsCollection.insertOne(car);
      res.send(result);
    });

    // update api
    app.patch("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const car = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          dailyRentPrice: car.dailyRentPrice,
          carType: car.carType,
          imageUrl: car.imageUrl,
          location: car.location,
          availability: car.availability,
          description: car.description,
        },
      };
      const result = await carsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // delete api
    app.delete("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.deleteOne(query);
      res.send(result);
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
