const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const {mongoose} = require('../db/mongoose');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        minlength: 4,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        trim: true
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});


UserSchema.methods.generateAuthToken = function() {
    var user = this;
    const access = 'auth';
    const token =  jwt.sign({_id: user._id.toHexString(), access}, 'TrainingApp12$').toString();

    user.tokens.push({access, token});

    return user.save().then(() => token);
};


UserSchema.statics.findByToken = function(token) {
    let User = this;
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, 'TrainingApp12$') 
    } catch (e) {
        return Promise.reject();
    }
    return User.findOne({
        '_id': decodedToken._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
};


UserSchema.statics.findByCredentials = function(uid, password) {
    let User = this;

    return User.findOne({uid}).then(user => {
        if(!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if(res) {
                    resolve(user)
                } else {
                    reject();
                }
            })
        });
    })
};


UserSchema.methods.toJSON = function() {
    var user = this.toObject();
    return _.pick(user, ['_id', 'uid'])
};


UserSchema.methods.removeToken = function(token) {
    var user = this;

    return user.updateOne({
        $pull: {
            tokens: {token}
        }
    })
}

UserSchema.pre('save', function(next){
    var user = this;

    if(user.isModified('password')){
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash
                next();
            })
        })        
    }else {
        next();
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = {User};