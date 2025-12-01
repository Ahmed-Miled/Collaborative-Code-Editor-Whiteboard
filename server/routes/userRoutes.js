const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const auth = require("../middleware/auth");

// GET /users
router.get("/", auth, usersController.getUsers);
router.get("/me", auth, usersController.getUser);
router.get("/me/getInvitations", auth, usersController.getInvitations);
router.put(
  "/me/invitations/:roomId/accept",
  auth,
  usersController.acceptInvitation
);

router.put(
  "/me/invitations/:roomId/reject",
  auth,
  usersController.rejectInvitation
);



module.exports = router;
