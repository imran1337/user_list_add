const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const uri =
  "mongodb+srv://codingBird:fmThpdOqQuHg8XSB@cluster0.klaju.mongodb.net/usersdb?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  console.log("connected mongodb yay!!");
  const collection = client.db("usersdb").collection("users");

  app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

  app.post("/add-user", (req, res) => {
    const { name, email, phone } = req.body;
    const user = { name, email, phone };
    collection.insertOne(user).then((response) => {
      res.redirect("/");
    });
  });

  app.get("/users", (req, res) => {
    collection.find({}).toArray((err, documents) => res.send(documents));
  });

  app.get("/view/:id", (req, res) => {
    const { id } = req.params;
    findDataById(id).then((response) => res.send(response));
  });

  app.delete("/delete-user/:id", (req, res) => {
    const { id } = req.params;
    collection.deleteOne({ _id: ObjectId(id) }).then((result) => {
      console.log(result.deletedCount);
      res.send(result.deletedCount > 0);
    });
  });

  app.get("/edit-user/:id", (req, res) => {
    const { id } = req.params;
    findDataById(id).then((response) => res.send(response));
  });

  app.post("/save-edit-user", (req, res) => {
    const { id, name, email, phone } = req.body;
    collection
      .updateOne(
        { _id: ObjectId(id) },
        { $set: { name, email, phone }, $currentDate: { lastModified: true } }
      )
      .then((response) => {
        if (response.modifiedCount > 0) {
          res.redirect("/");
        } else {
          res.send("Something Went Wrong");
        }
      });
  });

  async function findDataById(id) {
    return await collection
      .findOne({ _id: ObjectId(id) })
      .then((response) => response)
      .catch((err) => console.log(err));
  }
});

app.listen(4007);
