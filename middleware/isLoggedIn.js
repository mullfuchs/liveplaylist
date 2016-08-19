module.exports = function(req,res,next) {
  if(!req.user){
    req.flash('error', 'you must be logged in to see this, I guess');
    res.redirect('/auth/login');
  }
  else{
    next();
  }
}