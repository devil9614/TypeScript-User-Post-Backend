module.exports.validateRegisterInput = (
    username: string,
    email: string,
    password: string,
    confirmPassword: any
 ) => {
     const errors = {};
    if(username.trim() === ''){
        throw new Error ("Username must not be empty");
    }

    if(email.trim() === ''){
        throw new Error ("Email cannot be empty");
    }
    else{
        const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if(!email.match(regEx)){
            throw new Error ("Enter valid email");
        }
    }

    if(password === ''){
        throw new Error ("Password must not be empty");
    }
    else if(password !== confirmPassword){
        throw new Error ("Password did not match");
    }

   return{
       errors,
       valid: Object.keys(errors).length < 1
   };
};

module.exports.validateLoginInput = (username: string, password: string) => {
    const errors = {};
    if (username.trim() === '') {
      throw new Error ("Username must not be empty");
    }
    if (password.trim() === '') {
      throw new Error ("Password must not be empty");
    }
  
    return {
      errors,
      valid: Object.keys(errors).length < 1
    };
};