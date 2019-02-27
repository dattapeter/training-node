const {mongoose} = require('../db/mongoose');
const jwt = require('jsonwebtoken');

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

const User = mongoose.model('User', UserSchema);

module.exports = {User};