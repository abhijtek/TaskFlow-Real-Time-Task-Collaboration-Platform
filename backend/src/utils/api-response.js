// for response a fresh codeneeds to be written
// in error we can use built in error class of node js
class ApiResponse{
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode;
        this.data  =data;
        this.message = message;
        this.success = statusCode < 400;
    }
};

export {ApiResponse};