import express from "express"
import { deleteNotification, getNotification, readNotification } from "../controllers/notificationController.js"

import { protectRoute } from "../middleware/protectRoute.js"
export const notificationRoutes = express.Router()

notificationRoutes.post("/getNotification",protectRoute,getNotification)
notificationRoutes.post("/deleteNotification",protectRoute,deleteNotification)
notificationRoutes.put("/readNotification",protectRoute,readNotification)