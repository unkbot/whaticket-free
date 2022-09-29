import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";

import * as BulkMessageController from "../controllers/BulkMessageController";
import isAuth from "../middleware/isAuth";

const upload = multer(uploadConfig);

const bulkMessageRoutes = express.Router();

bulkMessageRoutes.post(
  "/send",
  isAuth,
  upload.array("medias"),
  BulkMessageController.index
);

bulkMessageRoutes.post("/", isAuth, BulkMessageController.store);

bulkMessageRoutes.get("/report", isAuth, BulkMessageController.show);

bulkMessageRoutes.delete(
  "/d/:massMessageId",
  isAuth,
  BulkMessageController.remove
);

bulkMessageRoutes.delete("/clean", isAuth, BulkMessageController.clean);

export default bulkMessageRoutes;
