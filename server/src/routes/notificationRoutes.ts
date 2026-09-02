import { Router, Response } from "express"
import mongoose from "mongoose"
import { Notification } from "../models/Notification.js"
import { authenticateJWT, AuthRequest } from "../middleware/auth.js"

const router = Router()

// GET /api/notifications
router.get("/", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean()

    const unreadCount = await Notification.countDocuments({ userId: user._id, read: false })

    const formatted = notifications.map(n => ({
      ...n,
      id: n._id.toString()
    }))

    res.status(200).json({
      success: true,
      unreadCount,
      count: formatted.length,
      data: formatted
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching notifications" })
  }
})

// POST /api/notifications (Create notification)
router.post("/", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    const { title, message, type = "medicine", actionUrl, priority = "MEDIUM", metadata } = req.body
    if (!title || !message) {
      res.status(400).json({ success: false, message: "Title and message are required." })
      return
    }

    const newNotif = await Notification.create({
      userId: user._id,
      title,
      message,
      type: typeof type === "string" ? type.toLowerCase() : "medicine",
      actionUrl,
      read: false
    })

    res.status(201).json({
      success: true,
      data: { ...newNotif.toObject(), id: newNotif._id.toString() }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error creating notification" })
  }
})

// PATCH /api/notifications/:id/read
router.patch("/:id/read", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(200).json({ success: true, message: "Local notification marked as read" })
      return
    }
    const updated = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true })
    res.status(200).json({ success: true, data: updated })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error updating notification" })
  }
})

// POST /api/notifications/mark-all-read
router.post("/mark-all-read", authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!
    await Notification.updateMany({ userId: user._id, read: false }, { read: true })
    res.status(200).json({ success: true, message: "All notifications marked as read." })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error marking all read" })
  }
})

export default router
