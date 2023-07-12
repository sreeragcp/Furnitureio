const express = require("express");
const Razorpay=require('razorpay');
const user_route = express();

const auth =require("../middleware/auth");

user_route.set('views','./views/users');


const userController = require("../controllers/userController");
const couponController = require("../controllers/couponController")


user_route.get('/register',userController.loadRegister);
user_route.get('/login',auth.isLogout,userController.loginLoad);
user_route.post('/login',userController.verifyLogin);
user_route.get('/logout',userController.logout);
user_route.get('/',userController.loadHome);

// forgot password
user_route.get('/forget',auth.isLogout,userController.forgetLoad)
user_route.post('/forget',userController.forgetVerify)
user_route.get('/forgotOtpEnter',userController.forgotOtpEnter)
user_route.post('/verifyForgotOtp',userController.verifyForgotOtp)
user_route.get('/newPassword',userController.loadNewPassword)
user_route.post('/newPassword',userController.newPassword)



user_route.get('/userProfile',auth.isLogin,userController.loadUserProfile)
user_route.get('/userAddress',auth.isLogin,userController.userAddress)
user_route.post('/saveAddress',auth.isLogin,userController.saveAddress)
user_route.get('/userOrderDetail',auth.isLogin,userController.userOrderDetails)
user_route.get('/userOrderfullDetail',auth.isLogin,userController.userOrderfullDetails)
user_route.get('/walletHistory',auth.isLogin,userController.walletHistory)
user_route.get('/cancellOrder',auth.isLogin,userController.cancellOrder)
user_route.get('/returnOrder',auth.isLogin,userController.returnOrder)
user_route.get('/contact',userController.loadContact)


user_route.get('/otp',userController.LoadOtp)
user_route.post("/otp",userController.sendOtp);
user_route.post('/verifyOtp',userController.verifyOtp);
// user_route.post('/login',userController.verifyLogin);

// user product list

user_route.get('/productlist/:categoryId',auth.blockCheck,userController.productlist);
user_route.get('/productdetail/:productId',auth.blockCheck,userController.productDetail);
user_route.get('/shopPage',auth.blockCheck,userController.shopPage)
user_route.post("/sortProduct", userController.sortProduct);


// load cart

user_route.get('/loadCart',auth.blockCheck,auth.isLogin,userController.loadCart)
user_route.post('/cartUpdation',auth.isLogin,userController.updateCart)
user_route.get('/addToCart',auth.blockCheck,auth.isLogin, userController.addToCart)
user_route.get('/deleteCartProduct/:productId',userController.deleteCartProduct)

// checkout page

user_route.get('/checkOut',auth.isLogin,userController.checkout)
user_route.get('/loadPayment',auth.isLogin,userController.loadPayment)
user_route.get('/addAddress',auth.isLogin,userController.loadAddAddress)
user_route.post('/addAddress',auth.isLogin,userController.addAddress)
user_route.get('/editAddress',auth.isLogin,userController.loadEditAddress)
user_route.post('/editAddress',auth.isLogin,userController.editAddress)
user_route.get('/deleteAddress',auth.isLogin,userController.deleteAddress)
user_route.get('/toReview',auth.isLogin,userController.toReview)
user_route.get('/orderReview',auth.isLogin,userController.loadOrderReview)
user_route.get('/paymentDetails',auth.isLogin,userController.paymentDetails)
user_route.get('/checkStock',auth.isLogin,userController.checkStock)
user_route.post('/placeOrder',auth.isLogin,userController.placeOrder)
user_route.get('/orderConfirmation',userController.orderConfirmation)
user_route.post('/validateCoupon',couponController.validateCoupon)
// user_route.get('/downloadInvoice',auth.blockCheck, auth.isLogin,userController.downloadInvoice)
// user_route.get('/invoice',userController.invoice)


// user_route.get('/addToPayment',auth.isLogin,userController.addToPayment)

//whishlist

user_route.get('/addToWishlist',auth.isLogin,userController.addToWishlist)
user_route.get('/wishList',auth.isLogin,userController.wishlist)
user_route.get('/addToCartFromWishlist',auth.blockCheck, auth.isLogin ,userController.addToCartFromWishlist)
user_route.get('/removeWishlist',auth.blockCheck, auth.isLogin ,userController.removeWishlist)

//404

user_route.get('/load404',userController.load404)

// (req, res) => {
  
  
//     const categoryId = req.params.categoryId;
//     // Handle the categoryId parameter and perform the necessary logic
  
//     // Example response
//     res.send(`Category ID: ${categoryId}`);
//   });







module.exports = user_route