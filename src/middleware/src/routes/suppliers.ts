import { Router } from "express";
import { requireInternalToken } from "../middleware/internalAuth";

const router = Router();

router.get("/", requireInternalToken, async (req, res) => {
  res.json({
    suppliers: [],
    message: "Suppliers endpoint works",
  });
});

export default router;
