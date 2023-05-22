import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { urlSchema } from "../schemas/url.schema.js";
import { urlsShorten, getUrlById } from "../controllers/urls.controller.js";

const urlRouter = Router();

urlRouter.post("/urls/shorten",validateSchema(urlSchema),urlsShorten);
urlRouter.get("/urls/:id",getUrlById);

export default urlRouter;


