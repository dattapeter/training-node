const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {Template} = require('./models/template');
const {User} = require('./models/user');
const {authenticate} = require('./middlewares/authenticate');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth"
    );

    if(req.method === 'OPTIONS'){
        res.header("Access-Control-Allow-Methods",
        "POST, PUT, DELETE, GET, PATCH"
        );
    };

    next();
});

app.post('/template', (req, res) => {
    template = new Template({
        title: req.body.title,
        description: req.body.description
    });

    template.save().then(
        template => res.status(200).send(template),
        err => res.status(404).send(err)
    );
});

app.get('/templates', (req, res) => {
    Template.find().then(
        templates => res.status(200).send(templates),
        err => res.status(400).send(err)
    );
});


app.patch('/template/:id', (req, res) => {
    id = req.params.id;
    
    if(!ObjectID.isValid(id)){
        res.status(404).send();
    }

    const modifiedTemplate = _.pick(req.body, ['title', 'description' ,'trainings']) 

    Template.findByIdAndUpdate(id, modifiedTemplate, {new: true}).then(
        template => {
            if(!template){
                return res.status(404).send()
            }
            res.status(200).send(template);
        },
        err => res.status(404).send(err)
    );
 
});

app.delete('/template/:id', (req, res)=> {
    id = req.params.id;

    if(!ObjectID.isValid(id)){
        res.status(404).send();
    }

    Template.findByIdAndRemove(id).then(template => {
       if(!template) {
           return res.status(404).send();
       } 

       res.status(200).send(template)
    }).catch(
        err => res.status(400).send(err)
    )
});

app.post('/user/signup', (req, res) => {
    const body = _.pick(req.body, ['uid', 'password']);
    const user = new User(body);

    user.save().then(
        user => user.generateAuthToken()
        ).then(
             token => res.header('x-auth', token).send(user)
        ).catch(e => 
            res.status(401).send(e)
    )
});

app.post('/user/login', (req, res)=> {
    const body = _.pick(req.body, ['uid', 'password']);
    const user = new User(body);

    User.findByCredentials(body.uid, body.password).then(
        user => {
            user.generateAuthToken().then( token => {
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
})


app.listen(3000, () => {
    console.log('Server started on port 3000');
})