import { Router } from "express";
import { getUsers, getRanking} from "../controllers/user.controllers.js";

const userRouter = Router();

userRouter.get("/users/me",getUsers);
userRouter.get("/ranking",getRanking);

export default userRouter;

