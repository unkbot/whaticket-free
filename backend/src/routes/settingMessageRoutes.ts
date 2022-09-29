import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as SettingMessageController from "../controllers/SettingMessageController";

const settingRoutes = Router();

settingRoutes.get("/settingsMessage", isAuth, SettingMessageController.index);
settingRoutes.get(
  "/settingsMessage/:whatsappId",
  isAuth,
  SettingMessageController.show
);

settingRoutes.post("/settingsMessage", isAuth, SettingMessageController.store);

settingRoutes.put("/settingsMessage", isAuth, SettingMessageController.update);

export default settingRoutes;
