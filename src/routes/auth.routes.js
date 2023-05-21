import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { userSchema, sessionSchema } from "../schemas/auth.schemas.js";
import { signUp, signIn } from "../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post("/signup", validateSchema(userSchema), signUp);
authRouter.post("/signin",validateSchema(sessionSchema), signIn);

export default authRouter;