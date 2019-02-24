const {mongoose} = require('../db/mongoose');

const Training = mongoose.model('Training', {
    topic: {
        type: String,
        required: true,
        minlength: 5,
        trim: true 
    },
    duration: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Not Started'
    }
});


module.exports = {Training};