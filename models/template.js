const {mongoose} = require('../db/mongoose');

const Template = mongoose.model('Template', {
    title: {
        type: String,
        required: true,
        minlength: 5,
        trim: true 
    },
    description: {
        type: String,
        trim: true
    },
    trainings: [{
        topic: {
            type: String,
            trim: true
        },
        duration: {
            type: Number
        }
    }]
});


module.exports = {Template};