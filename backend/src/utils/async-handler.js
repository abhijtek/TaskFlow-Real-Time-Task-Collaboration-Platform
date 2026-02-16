const asyncHandler = (requestHandler) => {
    return (req,res,next)=>{
        Promise
        .resolve(requestHandler(req,res,next)) // all errors are handled automatically dont have to write try catch again and again
        .catch((err)=> next(err))
    }
};
export {asyncHandler};
