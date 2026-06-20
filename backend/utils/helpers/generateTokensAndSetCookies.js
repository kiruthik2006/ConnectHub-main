import jwt from "jsonwebtoken"

export const generateTokenAndSetCookie = async(userId,res)=>{

    const token = jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"15d"
    })

    res.cookie("jwt",token,{
        httpOnly:true, // this cookie only accessed by browser more secure
        maxAge:15*24*60*60*1000, //15daysd 
        sameSite:"strict", //CSRF XSS    
        })

    return token
}