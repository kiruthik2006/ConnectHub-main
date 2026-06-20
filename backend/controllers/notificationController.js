import mongoose from "mongoose"
import Notification from "../Models/notificaionModel.js"
import User from "../Models/userModel.js"
// import User from "../Models/userModel.js"

export const getNotification = async(req,res)=>{
      const currentUser = req.user._id
      console.log("currentIUser",currentUser)
    try {
         const user = await User.findById(currentUser)
         if(!user){
            return res.status(400).json({error:"User not login"})
         }
        const notification = await Notification.find({to:{$in:currentUser}}).populate({path:"from", select:"username profilePic"}).sort({createdAt:-1})
       
        const filteredNotification = notification.filter((notifi)=>notifi.from.toString() !== notifi.to.toString())
       
        res.status(200).json(filteredNotification)
    } catch (error) {
        console.log("error in getNotification",error)
        res.status(400).json({error:error.message})
    }
}

export const deleteNotification = async(req,res)=>{
    
    const {notificationId} = req.body
    try {
        const notification = await Notification.findById(notificationId)
        if(!notification){
            return res.status(400).json({error:"notification not found"})
        }
        await Notification.findOneAndDelete({_id:notificationId})
       
       res.status(200).json({message:"Notification deleted"})
    } catch (error) {
        console.log("error in deleteNotification",error)
        res.status(400).json({error:error.message})
    }
}

export const readNotification = async(req,res)=>{
   
    const {notificationId} = req.body
    
    try {
      

        // Use the ObjectId in your query
     await Notification.updateOne({_id:notificationId},{$set:{"read":"true"}})
        const notification = await Notification.findOne({_id:notificationId}).populate({path:"from", select:"username profilePic"})
        if(!notification){
            return res.status(400).json({error:"Notification not found"})
        }
        
    //   notificationUpdated.save()
    //   console.log(id)
    //   console.log(notificationUpdated)
       res.status(200).json(notification)
    } catch (error) {
        console.log("error in readNotification",error)
        res.status(400).json({error:error.message})
    }
}