const isLogout = async(req,res,next)=>{
    try {
        if(!req.session.admin_id){
            res.redirect('/admin')
        }else{
            next();
        }
        
        
    } catch (error) {
        console.log(error.message);
    }
}

const isLogin = async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            res.redirect('/admin/home')
        }
        else{
            next();
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}