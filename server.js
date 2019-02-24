const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {Training} = require('./models/training');

const app = express();

app.use(bodyParser.json());

app.post('/trainings', (req, res) => {
    let training = new Training({
        topic: req.body.topic,
        duration: req.body.duration
    });

    training.save().then(
        doc => res.send(doc),
        e => res.status(400).send(e) 
    );
});


app.get('/trainings', (req, res) => {
    Training.find().then(
        trainings => res.send({trainings}),
        e => res.status(400).send(e)
    );
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
})