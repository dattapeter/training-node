const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

const { Template } = require('./models/template');
const { Assignment } = require('./models/assignment');
const { User } = require('./models/user');
const { authenticate } = require('./middlewares/authenticate');

const app = express();

app.use(bodyParser.json());

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-auth'],
    exposedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-auth'],
}));

app.post('/template', authenticate, (req, res) => {
    template = new Template({
        title: req.body.title,
        description: req.body.description,
        userId: req.user._id
    });

    template.save().then(
        template => res.status(200).send(template),
        err => res.status(404).send(err)
    );
});

app.get('/templates', authenticate, (req, res) => {
    Template.find({ userId: req.user._id }).then(
        templates => res.status(200).send(templates),
        err => res.status(400).send(err)
    );
});


app.patch('/template/:id', authenticate, (req, res) => {
    id = req.params.id;

    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    }

    const modifiedTemplate = _.pick(req.body, ['title', 'description', 'trainings'])

    Template.findByIdAndUpdate(id, modifiedTemplate, { new: true }).then(
        template => {
            if (!template) {
                return res.status(404).send()
            }
            res.status(200).send(template);
        },
        err => res.status(404).send(err)
    );

});

app.delete('/template/:id', authenticate, (req, res) => {
    id = req.params.id;

    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    }

    Template.findByIdAndRemove(id).then(template => {
        if (!template) {
            return res.status(404).send();
        }

        res.status(200).send(template)
    }).catch(
        err => res.status(400).send(err)
    )
});

app.post('/user/signup', (req, res) => {
    const body = _.pick(req.body, ['uid', 'password']);
    const user = new User({
        uid:body.uid.toUpperCase(), 
        password: body.password
    });

    user.save().then(
        user => user.generateAuthToken()
    ).then(
        token => res.header('x-auth', token).send(user)
    ).catch(e =>
        res.status(401).send(e)
    )
});

app.post('/user/login', (req, res) => {
    const body = _.pick(req.body, ['uid', 'password']);

    User.findByCredentials(body.uid.toUpperCase(), body.password).then(
        user => {
            user.generateAuthToken().then(token => {
                res.header('access-control-expose-headers', 'x-auth')
                res.header('x-auth', token);
                res.status(200).send(user);
            })
        }
    ).catch(e => {
        res.status(401).send(e);
    })

});

app.get('/user', authenticate, (req, res) => {
    res.status(200).send(req.user);
});

app.delete('/user/logout', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch(e => {
        res.status(401).send(e);
    })
});

app.post('/assignments', authenticate, (req, res) => {

    let error;
    const storedAssignments = [];

    req.body.forEach(
        assignment => {
            new Assignment(assignment).save().then(
                assignment => storedAssignments.push(assignment),
                err => error = err
            )
        }
    );
    if(error) {
       return res.status(404).send(error)
    }
    res.status(200).send(storedAssignments);
});


app.get('/assignments', authenticate, (req, res) => {
    Assignment.find({ trainee: req.user.uid }).then(
        assignments => res.status(200).send(assignments),
        err => res.status(400).send(err)
    );
});


app.listen(3000, () => {
    console.log('Server started on port 3000');
})