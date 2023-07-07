const User = require('../models/userModel')

const isLogin = async(req,res,next)=>{

    try {
        if (req.session.user_id) {
            
               next();
        } else {

            res.redirect('/login');
        }
       
        
    } catch (error) {
        console.log(error.message)
    }
}

const isLogout = async(req,res,next)=>{

    try {

        if (req.session.user_id) {

            res.redirect('/')
            
        } 
        else{

            next();
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const blockCheck = async (req, res, next) => {

    try {
        if (req.session.user) {
            const id = req.session.blockedUser
            const user = await User.findById(id)

            if (user.isBlocked) {
                res.redirect('/logout')
            } else {
                next()
               
            }
        } else {
            next()
        }

    } catch (error) {
        console.log(error.message);
    }


}

module.exports ={
    isLogin,
    isLogout,
    blockCheck
}