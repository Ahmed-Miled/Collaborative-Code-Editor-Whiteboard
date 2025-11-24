const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const auth = require("../middleware/auth");

// GET /users
router.get("/", auth, usersController.getUsers);
router.get("/:id", auth, usersController.getUser);
router.get("/:id/getInvitations", auth, usersController.getInvitations);
router.post("/:id/invitations/:roomId/accept", auth, usersController.acceptInvitation);
router.post("/:id/invitations/:roomId/reject", auth, usersController.rejectInvitation);

module.exports = router;
