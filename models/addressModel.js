const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({

    userId:{
        type: String,
        required: true
    },

    name:{
        type: String,
        required: true
    },

    mobile:{
        type: Number,
        required: true
    },

    address:{
        type: String,
        required: true
    },

    landmark:{
        type:String,
        required:true
    },

    city:{
        type: String,
        required: true
    },
    
    is_default:{
        type:Boolean,
        required: true,
        default:false
    }
})
module.exports = mongoose.model('address', addressSchema)