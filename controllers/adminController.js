const { log } = require("handlebars");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Category = require('../models/categoryModel')
const Product = require('../models/productModel')
const multer = require('../helper/multer')
const Order = require('../models/orderModel')
const Address = require('../models/addressModel')
const mongoose = require('mongoose');
const moment = require('moment')
const { ObjectId } = require('mongodb')



const loadLogin = async (req, res) => {

    try {
        res.render('adminlogin');
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req, res) => {

    try {

        const email = req.body.email;
        const password = req.body.password;

        const adminData = await User.findOne({ email: email });
        // console.log(adminData);
        if (adminData) {

            const passwordMatch = await bcrypt.compare(password, adminData.password);

            if (passwordMatch) {

                if (adminData.is_admin === 0) {
                    res.render('adminlogin', { message1: "Email and password is incorrect" });

                } else {

                    req.session.admin_id = adminData._id;
                    // console.log(adminData._id);
                    res.redirect("/admin/home");
                }

            } else {
                res.render('adminlogin', { message2: "Email and password is incorrect" });
            }
        } else {
            res.render('adminlogin', { message3: "Email and password is incorrect" });
        }

    } catch (error) {
        console.log(error.message)
    }
}


const logout = async (req, res) => {

    try {
        req.session.destroy();
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
    }
}

const loadUserList = async (req, res) => {

    try {

        const usersList = await User.find()
        res.render('userlist', { user: usersList });

    } catch (error) {
        console.log(error.message)
    }
}

const loadCategoryList = async (req, res) => {
    try {
        const categoryList = await Category.find()
        console.log(categoryList,"this is category list")
        res.render('categories', { cate: categoryList })
    } catch (error) {
        console.log(error.message)
    }
}

const loadAddCategory = async (req, res) => {
    try {
        res.render("add_category")

    } catch (error) {
        console.log(error.message)
    }
}

const addCategory = async (req, res) => {
    const categoryName = req.body.name
    const image = req.file
    const uppercase=categoryName.toUpperCase()
    try {
        const categoryExist = await Category.findOne({ category: uppercase })
        if (!categoryExist) {
            const newCategory = new Category({ category: categoryName, imageUrl: image.filename }); await newCategory.save().then((response) => {
                res.redirect('/admin/categoryList')
            })
        }
        else {
            res.render('add_category',{message:"Category already Exist"})
        }

    } catch (error) {
        console.log(error.message)
    }
}

const loadEditCategory = async (req, res) => {
    try {
        const cateId = req.params.id
        const categoryData = await Category.findById(cateId)

        res.render('editCategory', { categoryData, user: req.session.admin })

    } catch (error) {
        console.log(error.message)
    }
}


// const editCategory = async (req, res) => {
//     try {
//         const cateId = req.params.id;
//         const categoryData = await Category.findById(cateId);
//         const existingImage = categoryData.imageUrl;
//         const files = req.files;
//         console.log(files,"this is image files")
//         let uploadedImages
//         if (!files) {
//             uploadedImages = existingImage
//         }
//         else {
//             uploadedImages = files
//         }
//         const categoryName = req.body.name
        
//         await Category.findByIdAndUpdate(
//             cateId,
//             {
//                 category: categoryName,
//                 imageUrl: uploadedImages,
//             }
//         );
//         req.session.CategoryUpdate = true;
        
//         res.redirect('/admin/categoryList')

//     } catch (error) {
//         console.log(error.message);
//     }
// }


const editCategory = async (req, res) => {
    try {
      const cateId = req.params.id;
      const categoryData = await Category.findById(cateId);
      const existingImage = categoryData.imageUrl;
      const file = req.file;
      let uploadedImages;
      if (file) {
        uploadedImages = file.filename;
      } else {
        uploadedImages = existingImage;
      }
  
      const categoryName = req.body.name;
  
      await Category.findByIdAndUpdate(cateId, {
        category: categoryName,
        imageUrl: uploadedImages,
      });
  
      req.session.CategoryUpdate = true;
  
      res.redirect('/admin/categoryList');
    } catch (error) {
      console.log(error.message);
    }
  };
  

const unlistCategory = async(req,res)=>{
    try {
        const categoryId = req.params.id
        const blockCategory = await Category.findById(categoryId )
        await Category.findByIdAndUpdate(categoryId , { $set: { is_Blocked: !blockCategory.is_Blocked } }, { new: true })
        res.redirect('/admin/categoryList')
    } catch (error) {
        console.log(error.message);
    }
}

const loadProductList = async (req, res) => {
    try {
        const products = await Product.find().populate('category')

        if (req.session.productSave) {
            res.render("products", {
                products,
                productUpdated: "Product added successfully!!",
                user: req.session.admin,
            });
            req.session.productSave = false;
        }
        if (req.session.productUpdate) {
            res.render("products", {
                products,
                productUpdated: "Product Updated successfully!!",
                user: req.session.admin,
            });
            req.session.productUpdate = false;
        } else {
            res.render("products", { products, user: req.session.admin });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const loadAddProduct = async (req, res) => {

    try {
        const category = await Category.find()
        res.render('add_products', { category })

    } catch (error) {
        console.log(error.message)
    }
}

const addProduct = async (req, res) => {

    try {
        const images = req.files.map((file) => {
            return file.filename;
        });
        const newProduct = new Product({
            productName: req.body.name,
            price: req.body.price,
            description: req.body.description,
            images: images,
            stock: req.body.stock,
            category: req.body.category,
            size: req.body.size,
            isDeleted: false

        }); await newProduct.save().then((response) => {
            res.redirect('/admin/productList')
        })

    } catch (error) {
        console.log(error.message);
    }
}

const userBlockUnblock = async (req, res) => {

    try {

        const userId = req.body.userId
        const action = req.body.action
        await User.findByIdAndUpdate(userId, { isBlocked: action === 'block' });
        // res.redirect('/userList')

        if (req.user && req.user._id.toString() === userId && action === 'block') {
            req.logout(); // Log out the user
        }
        res.json("SUCCESS")

    } catch (error) {
        console.log(error.message);
    }
}

const loadEditProduct = async (req, res) => {
    try {
        const proId = req.params.id;
        const productData = await Product.findById(proId);

        const category = await Category.find();
        // console.log(productData, "product");
        res.render("editProduct", { productData, category, user: req.session.admin });

    } catch (error) {
        console.log(error.message)
    }
}

const editProduct = async (req, res) => {
    try {
        const proId = req.params.id;
        const product = await Product.findById(proId);
        const existingImage = product.images;
        const files = req.files;
        let uploadedImages = [];

        if (files && files.length > 0) {
            const newImages = req.files.map((file) => file.filename);
            uploadedImages = [...existingImage, ...newImages];
            product.images = uploadedImages;
        } else {
            uploadedImages = existingImage
        }

        const { productName, price, quantity, description, category } = req.body;
        await Product.findByIdAndUpdate(
            proId,
            {
                name: productName,
                price: price,
                stock: quantity,
                description: description,
                category: category,
                images: uploadedImages,
            }
        );
        req.session.productUpdate = true;
        res.redirect("/admin/productList");

    } catch (error) {
        console.log(error.message);
    }
}

const unlistProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const blockProduct = await Product.findById(productId)
        await Product.findByIdAndUpdate(productId, { $set: { is_Blocked: !blockProduct.is_Blocked } }, { new: true })
        // console.log(true, 304);
        res.redirect("/admin/productList")
    } catch (error) {
        console.log(error.message)
    }
}

const orderList = async (req, res) => {
    try {

        const orders = await Order.find().sort({date:-1});
        let orderData = orders.map((order) => {
        let formattedDate = moment(order.date).format("MMMM D, YYYY");

            return {
                ...order._doc,
                date: formattedDate,
            };
        });

        res.render('order', { orderData });
    } catch (error) {
        console.log(error.message);
    }
};

const orderDetail = async (req, res) => {
    try {
        const orderId = req.query.id;
        const orderDatas = await Order.findById(orderId)
        const orderData = await Order.findById(orderId).populate('address');
        

        const totalPricePerProduct = orderDatas.product.map(item => ({
            productId: item.id,
            productName: item.name,
            productQuantity: item.quantity,
            productImages: item.images,
            productAddress: item.address,
            productPrice: item.price,
            totalPrice: item.price * item.quantity,
        }));
        res.render('orderDetail', { totalPricePerProduct,orderData })
    } catch (error) {
        console.log(error.message);
    }
}

const changeStatus = async(req,res)=>{
    try {
        const id = req.query.id
        const status= req.body.status
        const deliveredDate = new Date()
        const returnDate = new Date()
        returnDate.setDate(returnDate.getDate() + 5)
        if (status == 'Delivered') {
            const order = await Order.findByIdAndUpdate(
                id,
                { $set: { deliveredDate: deliveredDate, returnDate: returnDate } },
                { new: true }
            );
            console.log('delivered date and return date are updated')
        }
        const order = await Order.findByIdAndUpdate(
            id,
            { $set: { status: status } },
            { new: true }
        );
        res.redirect("/admin/orderList")

    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    loadLogin,
    verifyLogin,
    logout,
    loadUserList,
    loadCategoryList,
    loadAddCategory,
    loadProductList,
    loadAddProduct,
    addCategory,
    unlistCategory,
    addProduct,
    userBlockUnblock,
    loadEditProduct,
    editProduct,
    loadEditCategory,
    editCategory,
    unlistProduct,
    orderList,
    orderDetail,
    changeStatus,
}