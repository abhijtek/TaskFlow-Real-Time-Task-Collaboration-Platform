import {ApiResponse} from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js";

// const  healthCheck = async (req,res, next) =>{
//     try{
//         const user = await getUserFromDB();
//         res
//         .status(200)
//         .json(new ApiResponse(200,{
//               message : 
//                 "Server is running"
//             })
//         )
//     }
//     catch (error)
//     {
//       next(err) // using express built in error handlers
//     }
// };
 // no need of this error handling now, already async handled in utils async handler // LEc-112
 const healthCheck = asyncHandler(async(req,res)=>{
    res
    .status(200)
    .json(new ApiResponse(200,{message : "Server is Running"}));
 });
export {healthCheck};