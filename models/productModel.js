const mongoose = require('mongoose')
const Schema = mongoose.Schema
ObjectId = Schema.ObjectId
const productSchema = new mongoose.Schema({

    productName: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type: Array,
    },

    stock: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    is_Blocked: {
        type: Boolean,
    },
    isOnCart:{
        type:Boolean,
        default:false
    },

    isWishlisted:{
        type:Boolean,
        default:false
    }
   

})
module.exports = mongoose.model('Product',productSchema)

