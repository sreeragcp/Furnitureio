const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel')
const moment = require('moment');
const { log } = require('handlebars');

const loadCouponPage = async(req,res)=>{
    try {
        const coupon = await Coupon.find()
        const couponData = coupon.map((element) => {
            const formattedDate = moment(element.expiryDate).format("MMMM D, YYYY");
            return {
                ...element,
                expiryDate: formattedDate,
            };
        })
        res.render('coupon',{couponData})
    } catch (error) {
        console.log(error.message);
    }
}


const loadAddCouponPage = async (req, res) => {
    try {
        res.render('add_coupon')
    } catch (error) {
        console.log(error.message)
    }
}

const addCoupon = async(req,res)=>{
    try {

        const { couponCode, couponDiscount,couponAmount, couponDate } = req.body;

        const couponCodeUpperCase = couponCode.toUpperCase();
      
        const couponExist = await Coupon.findOne({ code: couponCodeUpperCase });

        if(!couponExist){
            const coupon = new Coupon({
                code :couponCodeUpperCase,
                discount :couponDiscount,
                maxAmount :couponAmount,
                expiryDate :couponDate
            })
            await coupon.save()

             res.json({ message:"coupon added" });
        }
        else{
            res.json({ message:"coupon exists" });
        }
     
        
    } catch (error) {
        console.log(error.message);
    }
}

const validateCoupon = async(req,res)=>{
    try {
        console.log('inside validate coupon API')
        const { coupon, subTotal } = req.body;
        const couponData = await Coupon.findOne({ code: coupon });

        if (!couponData) {
            res.json("invalid");
        } else if (couponData.expiryDate < new Date()) {
            res.json("expired");
        } else {
            const couponId = couponData._id
            const discount = couponData.discount
            const userId = req.session.user_id

            const couponUsed = await Coupon.findOne({ _id: couponId, usedBy: { $in: [userId] } });

            if (couponUsed) {
                res.json("already used");
            } else {
                

                const discountValue = Number(discount);

                const discountAmount = (subTotal * discountValue) / 100;

                const newTotal = subTotal - discountAmount;

                const couponName = coupon

                res.json({
                    discountAmount,
                    newTotal,
                    couponName
                });
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const deleteCoupon = async(req,res)=>{
    try {
        const id  = req.query.id;
        await Coupon.findByIdAndDelete(id);
        res.redirect("/admin/loadCouponPage");
    } catch (error) {
        console.log(error.message);
    }
}

const loadeditCoupon = async(req,res)=>{
    try {
        const id =req.query.id
        const couponData = await Coupon.findById(id)
        console.log(couponData,118);
        res.render('editCoupon',{couponData})
    } catch (error) {
        console.log(error.message);
    }
} 

const editCoupon = async(req,res)=>{

    try {
        const couponCode = req.body.couponCode
        const couponDiscount=req.body.couponDiscount
        const couponAmount = req.body.couponAmount
        const couponDate = req.body.couponDate
        const couponId =req.body.id

        console.log(req.body,134);
        const couponCodeUpperCase = couponCode.toUpperCase();
        console.log(couponCodeUpperCase,136);
      
        const couponExist = await Coupon.findOne({ code: couponCodeUpperCase });

        console.log(couponExist,140);
        if(!couponExist){  
                         
            await Coupon.findByIdAndUpdate(
               couponId,
                {
                    $set: {
                        code:couponCode,
                        discount: couponDiscount,
                        maxAmount: couponAmount,
                        expiryDate: couponDate
                    }
                },
    
            );
            
             res.redirect("/admin/loadCouponPage");

        }
        else{
            res.render("editCoupon",{ message:"coupon exists" });
        }
        
    } catch (error) {
        
    }
}




module.exports={
    loadCouponPage,
    loadAddCouponPage,
    addCoupon,
    validateCoupon,
    deleteCoupon,
    loadeditCoupon,
    editCoupon
}
