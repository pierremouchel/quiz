if (error_type == 0) {
  response.render('index.ejs',{error_type:error_type});
} else if (error_type == 1) {
  response.render('index.ejs',{signin_error:signin_error,error_type:error_type,signin_login:signin_login,signin_password:signin_password});
} else if (error_type == 2) {
  response.render('index.ejs',{signup_error:signup_error,error_type:error_type,login:login,password:password,confpassword:confpassword,email:email,confemail:confemail,country:country});
}
