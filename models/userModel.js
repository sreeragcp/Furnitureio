const mongoose = require("mongoose");

const userSchema= new mongoose.Schema({

    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true

    },
    is_admin:{
        type:Number,
        default:0
    },isBlocked:{
        type:Boolean,
        default:false
    },
    wishlist:[
        { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
      ],
      
    cart:[
        {
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            quantity:{
                type: Number, 
                default: 1
            }      
        }
      ],

      wallet: {
        type: Number,
        default: 200
      }
    
});

module.exports = mongoose.model('User',userSchema);