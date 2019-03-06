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
    }],
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});


module.exports = {Template};