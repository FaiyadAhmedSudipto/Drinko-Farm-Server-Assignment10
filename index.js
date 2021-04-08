const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.edzrn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const port = process.env.PORT || 5055

const app = express()

app.use(cors());
app.use(bodyParser.json());

var serviceAccount = require("./configs/burj-al-arab-after-auth-done-firebase-adminsdk-ws5sl-226528ce22.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIRE_DB
});


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("volunteer").collection("bookings");
    const eventCollection = client.db("volunteer").collection("events");

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        // console.log(newBooking);
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
                // console.log(result);
            })
    })

    app.get('/events', (req, res) => {
        eventCollection.find({})
            .toArray((err, items) => {
                res.send(items)
                // console.log("From Database", items);
            })
    })

    app.get('/events/:id', (req, res) => {
        eventCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, items) => {
                res.send(items[0])
                // console.log("From Database", items);
            })
    })

    app.post('/addProduct', (req, res) => {
        const newEvent = req.body;
        console.log("adding new event: ", newEvent);
        eventCollection.insertOne(newEvent)
            .then(result => {
                console.log('Inserted Count', result.insertedCount)
                res.send(result.insertedCount > 0)
            })
    })

    

    app.get('/bookings', (req, res) => {
        bookings.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/items', (req, res) => {
        eventCollection.find({})
            .toArray((err, items) => {
                res.send(items)
                // console.log("From Database", items);
            })
    })

    app.delete('/delete/:id', (req, res) => {
        console.log(req.params.id);
        eventCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                console.log(result);
                res.send(result.deletedCount > 0);
            })
    })
    app.delete('/remove/:id', (req, res) => {
        console.log(req.params.id);
        bookings.deleteOne({ _id: req.params.id })
            .then(result => {
                console.log(result);
                // res.send(result.deletedCount > 0);
            })
    })

});


app.get('/', (req, res) => {
    res.send('This is Server!')
})

app.listen(port)