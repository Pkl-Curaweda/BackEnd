const handleError = function(err){
    console.log(err.message, err.code);
    let errors = { email: '', password: ''};

    //Incorect email
    if(err.message === 'incorect email')
    {
        errors.email = "that email is not registered"
    }
    if(err.message === 'incorect password')
    {
        errors.password = "that password is incorect"
    }

    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    };

    if(err.code === 11000){
        errors.email = 'that email is already been taken';
        return errors;
    }

    return errors;
}

module.exports = handleError