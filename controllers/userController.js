const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Address = require("../models/addressModel");
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel')
const mongoose = require('mongoose');
const moment = require('moment')
const { log } = require('handlebars/runtime');
const { ObjectId } = require('mongodb');
// const puppeteer = require('puppeteer');
const randomstring = require('randomstring')


function generateOtp() {
    let otp = "";
    for (let i = 0; i < 6; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
    //hhhhh
}


const securePassword = async (password) => {
    try {

        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }
}

const sendOtpMail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "sreeragkunnothuparamba@gmail.com",
                pass: "rvklnptctmecfkxj"
            },
        });
        const mailOptions = {
            from: "srecomeragkunnothuparamba@gmail",
            to: email,
            subject: "your otp verification code",
            html:
                "<p> Your Furniterio registration one time password is  " + otp + " </p>",
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been sent :-", info.response);
            }
        });

    } catch (error) {
        console.log(error.message);
    }
}

const loadRegister = async (req, res) => {

    try {
        const Data = await Category.find()
        const email = req.body.email
        const mail = await User.findOne({ email: email })
        res.render('registration', { Data });

    } catch (error) {
        res.render('404')

    }
}

// user signup
let forgetOtp
let savedOtp;
let firstName;
let lastName;
let email;
let password;
let forgotEmail

const sendOtp = async (req, res) => {

    try {
        const otp = generateOtp();
        savedOtp = otp;
        firstName = req.body.firstName;
        lastName = req.body.lastName;
        email = req.body.email
        password = req.body.password;

        const userExist = await User.findOne({ email: req.body.email });

        if (!userExist) {
            sendOtpMail(email, otp);
            res.render("otp");
        }
        else {
            res.render("registration", { message: "Your email is already registered" });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const verifyOtp = async (req, res) => {
    const otp = req.body.otp;
    if (otp === savedOtp) {

        const newpassword = await securePassword(password);
        const user = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: newpassword

        });
        const userEmail = await User.findOne({ email: email });
        if (!userEmail) {
            const userData = user.save();
            if (userData) {
                res.redirect('/login');
            }
            else {
                res.render("registration", { message: "Your registration has been failed" });
            }
        }
        else {
            res.render("registration", {
                message: "Entered mail is already registered",
            });
        }
    } else {
        res.render("otp", { error: "Invalid OTP" });
    }
}

//login user methods start

const loginLoad = async (req, res) => {

    const categoryallData = await Category.find()

    try {
        res.render('login', { categoryallData });
    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async (req, res) => {
    try {
        const categoryData = await Category.find()
        const productallData = await Product.find();
        if (req.session.user_id) {
            const userId = req.session.user_id
            const userData = await User.findById(userId)
            res.render('userhome', { categoryData: categoryData, user: userData });
        }
        else {
            res.render('userhome', { categoryData: categoryData });
        }


    } catch (error) {
        res.render('404')
    }
}

const verifyLogin = async (req, res) => {

    try {
        const categoryData = await Category.find()
        const productallData = await Product.find();
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });

        if (userData) {
            if (userData.isBlocked == false) {

                const passwordMatch = await bcrypt.compare(password, userData.password);
                if (passwordMatch) {
                    req.session.user_id = userData._id;
                    let user = req.session.user_id;
                    res.render('userhome', { categoryData: categoryData, user });
                } else {
                    res.render('login', { message: "Email and password is incorrect" });
                }

            } else {
                res.render('login', { message: "Email and password is incorrect" });
            }
        }
        else {
            res.render('login', { message: "You are blocked" })
        }

    } catch (error) {
        res.render('404')
    }
}


const forgetLoad = async (req, res) => {
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message);
    }
}

const sendForgotPasswordOtp = async (email, forgotPasswordOtp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "sreeragkunnothuparamba@gmail.com",
                pass: "rvklnptctmecfkxj"
            },
        });
        const mailOptions = {
            from: "sreeragkunnothuparamba@gmail.com",
            to: email,
            subject: " FURNITUREIO  Forgot Password",
            html:
                "<p> otp for Forgot Password   " + forgotPasswordOtp + " </p>",
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been sent :-", info.response);
            }
        });

    } catch (error) {
        res.render('404')
    }
}

const forgetVerify = async (req, res) => {
    try {
        forgotEmail = req.body.email
        const ExistingEmail = await User.findOne({ email: forgotEmail })

        if (ExistingEmail) {
            const forgotPasswordOtp = generateOtp();
            forgetOtp = forgotPasswordOtp
            sendForgotPasswordOtp(forgotEmail, forgotPasswordOtp)
            res.redirect('/forgotOtpEnter')
        }
        else {
            res.render('forget', { message: "email is incorrect" })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const forgotOtpEnter = async (req, res) => {
    try {
        res.render('forgotOtpEnter')
    } catch (error) {
        console.log(error.messagee);
    }
}

const verifyForgotOtp = async (req, res) => {
    try {
        const otp = req.body.otp

        if (forgetOtp = otp) {
            res.redirect('/newPassword')
        }
        else {
            res.redirect('/forgotOtpEnter')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadNewPassword = async (req, res) => {
    try {
        res.render('newPassword')
    } catch (error) {
        console.log(error.message);
    }
}

const newPassword = async (req, res) => {
    try {
        const password = req.body.password
        const newpassword = await securePassword(password)
        const user = await User.findOneAndUpdate(
            { email: forgotEmail },
            { $set: { password: newpassword } },
        );
        res.redirect('/login')

    } catch (error) {
        console.log(error.message);
    }
}


const productlist = async (req, res) => {
    try {
        const categoryId = req.params.categoryId
        const productData = await Product.find({ category: categoryId });
        const categoryData = await Category.findById(categoryId)
        const Data = await Category.find()
        res.render('productList', { data: productData, cateData: categoryData, Data: Data })
    } catch (error) {
        res.render('404')
    }
}

const loadContact = async (req, res) => {
    try {
        const Data = await Category.find()
        res.render('contact', { Data: Data })
    } catch (error) {
        res.render('404')
    }
}

const productDetail = async (req, res) => {
    try {
        const productId = req.params.productId;
        const productData = await Product.findById(productId).populate('category');
        const categoryData = await Category.find({ is_blocked: false });
        let cartId = null;
        let userData = null;

        if (req.session.user_id) {
            const user = await User.findOne({ _id: req.session.user_id }).populate("cart.product").lean();

            if (user && user.cart && user.cart.length > 0) {
                cartId = user.cart[0]._id;
            }

            userData = req.session.user_id;
        }


        res.render("productDetail", { productData, productId, cartId, categoryData, userData });
    } catch (error) {
        console.log(error.message);
        res.render('404')

    }
};



// load otp page

const LoadOtp = async (req, res) => {

    try {
        res.render('/otp')
    } catch (error) {
        console.log(error.message);
    }
}

// log out

const logout = async (req, res) => {

    const categoryData = await Category.find()
    const productallData = await Product.find();
    try {
        req.session.destroy((error) => {
            if (error) {
                console.log(error.message);
            } else {
                res.render('userhome', { categoryData, productallData });
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};

const
    loadCart = async (req, res) => {

        try {
            const userData = req.session.user_id

            if (userData) {

                const userData = req.session.user_id;
                const categoryData = await Category.find({ is_blocked: false });

                const user = await User.findOne({ _id: userData }).populate("cart.product").lean();
                console.log(user)
                const cart = user.cart;
                console.log(cart)
                let subTotal = 0;

                cart.forEach((val) => {
                    val.total = val.product.price * val.quantity;
                    subTotal += val.total;
                });

                const productNum = cart.length
                console.log("this is cart");
                console.log(cart);
                res.render("cart", { userData, cart, subTotal, categoryData, productNum });


            }
            else {
                res.redirect('/login')
            }
        } catch (error) {
            res.render('404')
        }
    }

const addToCart = async (req, res) => {
    try {
        const userData = req.session.user_id
        const productId = req.query.id;
        const quantity = req.query.quantity
        const product = await Product.findById(productId);

        const existed = await User.findOne({ _id: userData, "cart.product": productId });

        if (existed) {

            const result = await User.findOneAndUpdate(
                { _id: userData, "cart.product": productId },
                { $inc: { "cart.$.quantity": quantity } },
                { new: true }
            );

            res.json({ message: "Item already in cart!!" });
        } else {
            await Product.findByIdAndUpdate(productId, { isOnCart: true });
            await User.findByIdAndUpdate(
                userData,
                {
                    $push: {
                        cart: {
                            product: product._id,
                            quantity: quantity,
                        },
                    },
                },
                { new: true }
            );


            res.json({ message: "Item added to cart" });
        }
    } catch (error) {
        console.log(error.message);
        // const userData = req.session.user;
        // res.render("404", { userData });
    }
};


const checklogin = async (req, res) => {

    // Check if the user is logged in
    if (req.session.user) {
      // User is logged in
      res.json({ loggedIn: true });
    } else {
      // User is not logged in
      res.json({ loggedIn: false });
    }
  
  
  
  }


const updateCart = async (req, res) => {
    try {
        const userData = req.session.user_id;
        const data = await User.find({ _id: userData }, { _id: 0, cart: 1 }).lean();

        data[0].cart.forEach((val, i) => {
            val.quantity = req.body.datas[i].quantity;
        });

        await User.updateOne({ _id: userData }, { $set: { cart: data[0].cart } });
        res.status(200).send();
    } catch (error) {
        console.log(error.message);
    }
};

const deleteCartProduct = async (req, res) => {
    try {
        const userId = req.session.user_id
        const productId = req.params.productId
        await User.updateOne(
            { _id: userId },
            { $pull: { cart: { product: productId } } }
        );
        res.redirect('/loadCart')



    } catch (error) {
        console.log(error.message);
    }

}


const wishlist = async (req, res) => {
    try {
        const userData = req.session.user_id
        const categoryData = await Category.find({ is_blocked: false })
        const user = await User.findById(userData).populate("wishlist")
        const wishlistItems = user.wishlist
        const userCart = await User.findOne({ _id: userData }).populate("cart.product").lean()
        const cart = userCart.cart
        console.log(cart, 396);
        res.render('wishlist', { categoryData, userData, wishlistItems, cart })
    } catch (error) {
        console.log(error.message)
    }
}

const addToWishlist = async (req, res) => {

    console.log("in to the Api");
    try {
        const userData = req.session.user_id
        const productId = req.query.productId
        const cartId = req.query.cartId

        console.log(userData, 418);
        const existItem = await User.findOne({ _id: userData, wishlist: { $in: [productId] } });

        if (!existItem) {
            await User.updateOne({ _id: userData }, { $push: { wishlist: productId } });
            await Product.updateOne({ _id: productId }, { isWishlisted: true });

            await Product.findOneAndUpdate({ _id: productId }, { $set: { isOnCart: false } }, { new: true });
            await User.updateOne({ _id: userData }, { $pull: { cart: { _id: cartId } } });

            res.json({
                message: "Added to wishlist",
            });
        } else {
            res.json({
                message: "Already Exists in the wishlist",
            });
        }
    } catch (error) {
        console.log(error.message)
    }
}

const addToCartFromWishlist = async (req, res) => {
    try {
        const userData = req.session.user_id
        const productIds = req.query.productId
        const productId = new ObjectId(productIds);


        const user = await User.findById(userData)
        const product = await Product.findById(productId)
        const existed = await User.findOne({ _id: userData, "cart.product": productId })

        if (existed) {

            res.json({ message: "Product is already in cart!!" });

        } else {

            await Product.findOneAndUpdate(productId, { isOnCart: true })
            await User.findByIdAndUpdate(
                userData,
                {
                    $push: {
                        cart: {
                            product: product._id,
                            quantity: 1
                        }
                    }
                },
                { new: true }
            )
            const itemIndex = user.wishlist.indexOf(productId)

            if (itemIndex >= 0) {
                await User.updateOne({ _id: userData }, { $pull: { wishlist: productId } })
                await Product.updateOne({ _id: productId }, { isWishlisted: false })

            } else {
                res.json({
                    message: "Error Occured!"
                })
            }

            res.json({ message: "Moved to cart from wishlist" })
        }

    } catch (error) {
        console.log(error.message);
    }
}

const removeWishlist = async (req, res) => {
    try {
        const userData = req.session.user_id
        const productId = req.query.productId

        const user = await User.findById(userData)
        const itemIndex = user.wishlist.indexOf(productId)
        console.log(itemIndex)
        if (itemIndex >= 0) {
            await User.updateOne({ _id: userData }, { $pull: { wishlist: productId } })
            await Product.updateOne({ _id: productId }, { isWishlisted: false })

            res.status(200).send();
        } else {
            res.json({
                message: "Error Occured!"
            })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const load404 = async (req, res) => {

    try {
        res.render('404')
    } catch (error) {
        console.log(error.message)
    }
}

const checkout = async (req, res) => {
    try {
        const userId = req.session.user_id
        const addressData = await Address.find({ userId: userId });

        res.render('checkout1', { addressData })
    } catch (error) {
        console.log(error.message)
    }
}

const loadPayment = async (req, res) => {

    console.log("inside load payment ");
    try {
        const addressId = req.query.addressId
        const addressData = await Address.findById(addressId)
        console.log(addressData);
        req.session.paymentAddress = addressData
        console.log(addressData, 488);
        res.status(200).send()
    } catch (error) {
        console.log(error.message)
    }
}


const loadAddAddress = async (req, res) => {
    try {
        res.render('addAddress')
    } catch (error) {
        console.log(error.message)
    }
}

const addAddress = async (req, res) => {
    try {
        const userId = req.session.user_id
        const address = new Address({
            userId: userId,
            name: req.body.firstname,
            mobile: req.body.mno,
            address: req.body.address,
            landmark: req.body.landmark,
            city: req.body.city,
            is_default: false,
        })
        await address.save()

        res.redirect('/checkOut')
    } catch (error) {
        console.log(error.message)
    }
}

const saveAddress = async (req, res) => {
    try {
        const id = req.body.addressId;
        userData = req.session.user_id;
        if (userData !== 'undefined') {
            await Address.findByIdAndUpdate({ _id: id }, {
                name: req.body.name,
                address: req.body.address,
                landmark: req.body.landmark,
                city: req.body.city,
            })
            const Addresses = await Address.find({ userId: userData })
            res.redirect("/userAddress")
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadEditAddress = async (req, res) => {
    try {
        const userId = req.session.user_id
        const addressData = await Address.find({ userId: userId });
        res.render('editaddress', { addressData })
    } catch (error) {
        console.log(error.message)
    }
}

const editAddress = async (req, res) => {
    try {
        const addressId = req.query.addressId

        const editAddress = await Address.findByIdAndUpdate(
            addressId,
            {
                name: req.body.firstname,
                mobile: req.body.mno,
                address: req.body.address,
                landmark: req.body.landmark,
                city: req.body.city,
            },
            { new: true }

        );

        res.redirect('/checkOut')

    } catch (error) {
        console.log(error.message);
    }
}

const deleteAddress = async (req, res) => {
    try {
        console.log("enter");
        const userData = req.session.user_id
        const addressId = req.query.id

        await Address.findByIdAndDelete(addressId)
        console.log("deleted");

        res.json({ success: true })

        // res.redirect('/checkOut')

    } catch (error) {
        console.log(error.message);
    }
}

const loadOrderReview = async (req, res) => {
    try {
        const user_id = req.session.user_id
        const userData = await User.findById(user_id)
        const addressData = req.session.paymentAddress
        const payment = req.session.payment
        const Data = await Address.findById(addressData)
        const userCart = await User.findOne({ _id: user_id }).populate("cart.product").lean()
        const cart = userCart.cart

        let subTotal = 0;

        cart.forEach((val) => {
            val.total = val.product.price * val.quantity;
            subTotal += val.total;
        });

        const now = new Date();
        const availableCoupons = await Coupon.find({
            expiryDate: { $gte: now },
            usedBy: { $nin: [user_id] },
            status: true,
        });

        res.render('orderReview', { Data, cart, subTotal, payment, userData, availableCoupons })
    } catch (error) {
        console.log(error.message);
    }
}

const paymentDetails = async (req, res) => {
    try {
        const user_id = req.session.user_id
        const userData = await User.findById(user_id)
        res.render('payment', { userData })
    } catch (error) {
        console.log(error.message);
    }
}

const toReview = async (req, res) => {
    try {
        const payment = req.query.payment
        req.session.payment = payment
        res.json('success')
    } catch (error) {
        console.log(error.message);
    }
}

const checkStock = async (req, res) => {
    try {
        const userData = req.session.user_id
        const userCart = await User.findById({ _id: userData }).populate("cart.product").lean()
        const cart = userCart.cart
        let stock = []
        cart.forEach((element) => {
            if (element.product.stock - element.quantity <= 0) {
                stock.push(element.product);
            }
        })

        if (stock.length > 0) {
            res.json({ message: "Out of stock" });
        } else {
            res.json({ message: "In stock" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const placeOrder = async (req, res) => {
    let lastOrderId
    const couponData = req.body.couponData
    const userId = req.session.user_id
    let addressData = req.session.paymentAddress
    const address = await Address.findByIdAndUpdate(addressData._id, { is_default: true }, { new: true });
    console.log(addressData, "incoming");
    console.log(address, "selectedAddress");
    const payMethod = req.session.payment
    console.log(payMethod, 808);
    const userData = await User.findOne({ _id: userId }).populate('cart.product')
    const cartProduct = userData.cart

    console.log(couponData, 811);

    let couponName
    let discountAmount
    let subTotal = 0;
    cartProduct.forEach((val) => {
        val.total = val.product.price * val.quantity
        subTotal += val.total
    })

    const totalPrice = subTotal

    if (couponData) {
        subTotal = couponData.newTotal
        couponName = couponData.couponName
        discountAmount = couponData.discountAmount

    }



    let productDetail = cartProduct.map(item => {
        return {
            id: item.product._id,
            name: item.product.productName,
            price: item.product.price,
            quantity: item.quantity,
            images: item.product.images[0],
        }
    })
    const result = Math.random().toString(36).substring(2, 7);
    const id = Math.floor(100000 + Math.random() * 900000);
    const ordeId = result + id;

    let saveOrder = async () => {
        const DeliveryDate = new Date();
        DeliveryDate.setDate(DeliveryDate.getDate() + 3)

        if (couponData) {
            const order = new Order({
                userId: userId,
                product: productDetail,
                address: addressData,
                orderId: ordeId,
                total: totalPrice,
                totalAmount: subTotal,
                discountAmount: discountAmount,
                couponName: couponName,
                paymentMethod: payMethod,
                deliveredDate: DeliveryDate

            })
            await Coupon.updateOne({ code: couponName }, { $push: { usedBy: userId } })
            await order.save()
            const ordered = await order.save()
            lastOrderId = ordered.orderId

        } else {
            const order = await new Order({
                userId: userId,
                product: productDetail,
                address: addressData,
                orderId: ordeId,
                total: totalPrice,
                paymentMethod: payMethod,
                deliveredDate: DeliveryDate
            })
            await order.save()
            const ordered = await order.save()
            lastOrderId = ordered.orderId
        }
    }

    let userDetails = await User.findById(userId)
    let userCart = userDetails.cart

    userCart.forEach(async item => {
        const productId = item.product
        const qty = item.quantity

        const product = await Product.findById(productId)
        const stock = product.stock
        const updatedStock = stock - qty

        await Product.updateOne(
            { _id: productId },
            { $set: { stock: updatedStock, isOnCart: false } }
        );
    })



    userDetails.cart = []
    await userDetails.save()
    console.log(userDetails.cart, "this is product stock update section");
    if (addressData) {
        console.log('enterig saveorder functioon call if')
        if (payMethod === 'COD') {
            console.log('hellooo from cash on delivery......check check check..........');
            saveOrder()
            res.json({
                CODsuccess: true,
                total: subTotal,
                message: 'success',
                lastOrder: lastOrderId
            });
        }
        if (payMethod === 'Razorpay') {
            console.log('hellooo from RazorPay..................');
            saveOrder()
            res.json({
                Razorpaysuccess: true,
                total: subTotal,
                message: 'success',
                lastOrder: lastOrderId
            });
        }

        if (payMethod === 'wallet') {

            const newWallet = req.body.updateWallet
            const userId = req.session.user_id

            await User.findByIdAndUpdate(userId, { $set: { wallet: newWallet } }, { new: true })

            const transaction = {
                date: new Date(),
                details: `Confirmed Order - ${ordeId}`,
                amount: subTotal,
                status: "Debit",
            };

            await User.findByIdAndUpdate(userId, { $push: { "wallet.transactions": transaction } }, { new: true });
            saveOrder()

            res.json({
                Walletsuccess: true,
                total: subTotal,
                message: 'success',
                lastOrder: lastOrderId
            });
        }


    }
}


const orderConfirmation = async (req, res) => {


    try {
        const lastOrder = await Order.find().sort({ _id: -1 }).limit(1)
        const Date = moment(lastOrder.date).format("MMMM D, YYYY")

        res.render('orderConfirm', { lastOrder, Date })
    } catch (error) {
        console.log(error.message);
    }
}

const downloadInvoice = async (req, res) => {
    try {

        const orderId = req.query.orderId
        const orderData = await Order.findById(orderId)
        const browser = await puppeteer.launch({ headless: false })
        const page = await browser.newPage()

        await page.goto(`${req.protocol}://${req.get('host')}/invoice?orderId=${orderId}`, {
            waitUntil: 'networkidle2'
        })

        const todayDate = new Date()

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
        });

        await browser.close()

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=${orderData.orderId}Invoice.pdf`,
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.log(error.message);
    }
}

const invoice = async (req, res) => {
    try {

        const orderId = req.query.orderId;
        const orderData = await Order.findById(orderId)
        const userDatas = await User.findById(orderData.userId)
        const address = await Address.findById(orderData.address)

        console.log(orderData, 1003)
        console.log(userDatas, 1004)
        console.log(address, 1005)
        const invoiceDate = moment(new Date()).format('MMMM D, YYYY')
        res.render('invoice', { orderData, userDatas, invoiceDate, address })

    } catch (error) {
        console.log(error.message);
    }
}



const loadUserProfile = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userData = await User.findById(userId);
        // const addressData = await Address.findOne({ is_default: true });
        const addressData = await Address.findOne({ userId:userId, is_default: true });
        const Data = await Category.find()
        res.render('userProfile', { userData, addressData });
    } catch (error) {
        console.log(error.message);
    }
}

const userAddress = async (req, res) => {
    try {
        const address = await Address.find()
        console.log(address, 918);
        res.render('userAddress', { address })
    } catch (error) {
        console.log(error.message);
    }
}


const shopPage = async (req, res) => {
    try {
        const categoryData = await Category.find({});
        const search = req.query.search || "";
        const categoryId = req.query.cat || "";

        console.log(categoryId, "dfgbhnjmdcvbnm");
        const sort = req.query.sort || "";
        let query = {}

        if (categoryId !== "") {
            query.category = categoryId;
        }
        let sortQuery = "";
        if (sort !== "") {
            if (sort == "price-l-h") {

                sortQuery = { price: 1 };
            } else if (sort == "price-h-l") {
                sortQuery = { price: -1 };
            } else if (sort == "new") {
                sortQuery = { _id: -1 };
            }
        }

        if (search !== "") {
            console.log(search, "search");
            query.productName = { $regex: ".*" + search + ".*", $options: "i" };
        }


        const page = req.query.page || 1;

        const limit = 4;
        const totalPages = Math.ceil((await Product.countDocuments(query)) / limit);

        const skip = (page - 1) * limit;

        const productData = await Product.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit);

        if (req.session.user_id) {
            const userData = await User.findOne({ _id: req.session.user_id });
            console.log(totalPages, page, "fghjbnm,");
            res.render("shop", {

                userData: userData,
                productData: productData,
                categoryData,
                sort: sort,
                totalPages: totalPages,
                page: page,
            });
        } else {

            console.log(totalPages, page, "fghjbnm,");
            res.render("shop", {

                productData: productData,
                categoryData,
                sort: sort,
                totalPages: totalPages,
                page: page,
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};




const sortProduct = async (req, res) => {
    try {
        const sort = req.body.sort;
        const productData = await Product.find().sort({ price: sort });
        res.json(productData);
    } catch (error) {
        console.log(error.message);
    }
};



const userOrderDetails = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const orderData = await Order.find({ userId: userId }).populate('address').sort({ _id: -1 });

        const formattedOrders = orderData.map(order => ({
            orderId: order.orderId,
            orderDate: moment(order.date).format("MMMM D, YYYY"),
            orderStatus: order.status,
            subtotal: order.totalAmount,
            products: order.product.map(item => ({
                productName: item.name,
                productImages: item.images,
                productPrice: item.price,
                productQuantity: item.quantity,
            })),
        }));

        res.render('userOrderDetails', { orders: formattedOrders });
    } catch (error) {
        console.error(error.message);
    }
};

const userOrderfullDetails = async (req, res) => {
    try {
        const orderData = await Order.findOne({ orderId: req.query.id })
        const productData = orderData.product
        const Date = orderData.date
        const formattedDate = moment(Date).format("MMMM D, YYYY")
        const orderDatas = await Order.findOne({ orderId: req.query.id }).populate('address').lean();
        res.render('userOrderfullDetail', { orderData, productData, orderDatas, formattedDate })
    } catch (error) {
        console.log(error.message);
    }
}

const walletHistory = async (req, res) => {
    try {
        const userId = req.session.user_id
        const user = await User.findById(userId)
        const transactions = user.wallet.transactions.sort((a, b) => b.date - a.date);

        const newTransactions = transactions.map((transactions) => {
            const formattedDate = moment(transactions.date).format("MMMM D, YYYY");
            return { ...transactions.toObject(), date: formattedDate };
        });

        res.render('wallet', { newTransactions })

    } catch (error) {
        console.log(error.message);
    }
}


const cancellOrder = async (req, res) => {
    try {
        const user = req.session.user_id
        const userData = await User.findById(user)
        console.log(userData.wallet, 'userr wallet')
        const orderId = req.query.id;
        let orderData = await Order.findById(orderId);
        const orderIdValue = orderData.orderId
        const productId = orderData.product[0].id;
        const product = await Product.findById(productId);
        let newStock = product.stock + orderData.product[0].quantity
        const status = 'Cancelled';
        console.log(userData.wallet, " is the current balance and   ", orderData.totalAmount, 'return amount ')
        const order = await Order.findByIdAndUpdate(
            orderId,
            { $set: { status: status } },
            { new: true }
        );
        console.log('order status changed')
        const productDetail = await Product.findByIdAndUpdate(
            productId,
            { $set: { stock: newStock } },
            { new: true }
        );
        console.log('stock is updated')
        // console.log(orderData)
        if (orderData.paymentMethod == 'Wallet' || orderData.paymentMethod == 'Razorpay') {
            console.log('inside if case like waller and raazor pay')
            const newWallet = userData.wallet.balance + orderData.totalAmount
            console.log(newWallet,"newghjkk")
            const result = await Order.findByIdAndUpdate(orderId, { $set: { status: status }, $unset: { deliveredDate: "" } });
            console.log(result,'updated status and delivery date')
            const transaction = {
                date: new Date(),
                details: `Cancelled Order - ${orderIdValue}`,
                amount: newWallet,
                status: "Credit",
            };

            console.log(transaction, 'this is transactiono')
            await User.findByIdAndUpdate(user, { $push: { "wallet.transactions": transaction } }, { new: true });

        }
        res.redirect('/userProfile')

    } catch (error) {
        error.message
    }
}

const returnOrder = async (req, res) => {
    try {
        const userId = req.session.user_id
        const orderId = req.query._id
        const orderData = await Order.findById(orderId)
        const paymentMethod = await Order.findOne({ _id: orderId }, { [paymentMethod]: 1 })
        const status = await Order.findOne({ _id: orderId }, { [status]: 1 })
        const orderIdValue = orderData.orderId
        const total = orderData.totalAmount

        if (paymentMethod !== "COD") {
            await User.findByIdAndUpdate(userId, { $set: { "wallet.balance": updatedBalance } }, { new: true });

            if (status === "Returned") {
                await Order.findByIdAndUpdate(orderId, { $set: { status: status }, $unset: { deliveredDate: "" } });

                const transaction = {
                    date: new Date(),
                    details: `Returned Order - ${orderIdValue}`,
                    amount: total,
                    status: "Credit",
                };

                await User.findByIdAndUpdate(userId, { $push: { "wallet.transactions": transaction } }, { new: true });

            }

        }
        else if (paymentMethod == "COD" && status === "Returned") {
            await User.findByIdAndUpdate(userId, { $set: { "wallet.balance": updatedBalance } }, { new: true });

            const transaction = {
                date: new Date(),
                details: `Returned Order - ${orderIdValue}`,
                amount: total,
                status: "Credit",
            };

            await User.findByIdAndUpdate(userId, { $push: { "wallet.transactions": transaction } }, { new: true });

            await Order.findByIdAndUpdate(orderId, { $set: { status: status }, $unset: { deliveredDate: "" } });
        }

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadRegister,
    sendOtp,
    loginLoad,
    loadHome,
    loadContact,
    verifyLogin,
    generateOtp,
    sendOtp,
    sendOtpMail,
    verifyOtp,
    LoadOtp,
    productlist,
    productDetail,
    logout,
    forgetLoad,
    forgetVerify,
    forgotOtpEnter,
    sendForgotPasswordOtp,
    verifyForgotOtp,
    loadNewPassword,
    newPassword,
    loadCart,
    addToCart,
    updateCart,
    deleteCartProduct,
    checkout,
    wishlist,
    addToWishlist,
    addToCartFromWishlist,
    removeWishlist,
    load404,
    loadPayment,
    loadAddAddress,
    addAddress,
    saveAddress,
    loadEditAddress,
    editAddress,
    deleteAddress,
    loadOrderReview,
    paymentDetails,
    toReview,
    checkStock,
    placeOrder,
    orderConfirmation,
    downloadInvoice,
    invoice,
    loadUserProfile,
    userAddress,
    shopPage,
    sortProduct,
    userOrderDetails,
    userOrderfullDetails,
    walletHistory,
    cancellOrder,
    returnOrder,
    checklogin 
}