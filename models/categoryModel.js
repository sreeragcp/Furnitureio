const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
 
    category: {
        type: String,
        required: true
    },

    imageUrl:{
        type: String,
        required: true
    },
    
    is_Blocked:{
        type:Boolean
    }
})


module.exports = mongoose.model('Category', categorySchema )