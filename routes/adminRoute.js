const express = require("express");
const admin_route = express();
const adminController = require("../controllers/adminController");
const couponController = require("../controllers/couponController")
const adminDashController =require("../controllers/adminDashController")
const adminAuth = require("../middleware/adminAuth");
const multer = require('../helper/multer')

const { isLogin, isLogout } = adminAuth

const bodyParser = require("body-parser");
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));

admin_route.set('views','./views/admin');


//login
admin_route.get('/', isLogin ,adminController.loadLogin);

admin_route.post('/',adminController.verifyLogin);
admin_route.get('/home', isLogout,adminDashController.loadDashboard);
admin_route.get('/userList',adminController.loadUserList)
admin_route.get('/orderList',adminController.orderList)
admin_route.get('/orderDetail',adminController.orderDetail)
admin_route.post('/changeStatus',adminController.changeStatus)

//logout
admin_route.get('/logout',adminController.logout);


admin_route.get('/Category',adminController.loadAddCategory)
admin_route.post('/addCategory',multer.single('image'),adminController.addCategory)

//to get category page 

admin_route.get('/categoryList',adminController.loadCategoryList)
admin_route.get('/loadEditCategory/:id',multer.single('image'),adminController.loadEditCategory)
admin_route.post('/loadEditCategory/:id',multer.single('image'),adminController.editCategory)
admin_route.get('/deleteCategory/:id',adminController.unlistCategory)

// to load productlist

admin_route.get('/productList',adminController.loadProductList)

//add product

admin_route.get('/addProduct',adminController.loadAddProduct)
admin_route.post('/product',multer.array('image',3),adminController.addProduct)
admin_route.post('/userBlockUnblock',adminController.userBlockUnblock)

//edit product

admin_route.get('/loadEditProduct/:id',multer.array('image',3),adminController.loadEditProduct)
admin_route.post('/loadEditProduct/:id',multer.array('image',3),adminController.editProduct)
admin_route.get('/deleteProduct/:id',adminController.unlistProduct)

//coupon 

admin_route.get('/loadCouponPage',couponController.loadCouponPage)
admin_route.get('/loadAddCouponPage',couponController.loadAddCouponPage)
admin_route.post('/addCoupon',couponController.addCoupon)
admin_route.get('/deleteCoupon',couponController.deleteCoupon)
admin_route.get('/editCoupon',couponController.loadeditCoupon)
admin_route.post('/editCoupon',couponController.editCoupon)


// sales report

admin_route.get('/orderPdf',adminDashController.loadOrderPdf)
admin_route.post('/getOrders',adminDashController.getOrders)
admin_route.get('/getChartData',adminDashController.getChartData)
admin_route.get('/exportPdfDailySales',adminDashController.exportPdfDailySales)

///////
// admin_route.get('*',function(req,res){
//     res.redirect('/admin');
// })

module.exports = admin_route;