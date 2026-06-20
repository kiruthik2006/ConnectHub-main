import jwt from "jsonwebtoken"
import User from "../Models/userModel.js";

export const protectRoute = async(req,res,next)=>{
    try {
        const token = req.cookies.jwt
        if(!token){
            return res.status(400).json({message:"Unauthoried user"})
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(400).json({message:"no token found"})
        }
        const user = await User.findById(decoded.userId).select("-password")

        req.user = user

        next()
        
    } catch (error) {
        console.log("error in protectRoute:",error.message)
        res.status(500).json({message:error.message})
    }
}