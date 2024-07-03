import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import ProfileController from "../controllers/profileController.js";
import authMiddleware from "../middleware/AuthMiddleware.js";
import NewsController from "../controllers/NewsController.js";
// import redisCache from "../DB/redis.config.js";

const router = Router();
// authentication routes
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);
//send email route
router.get('/send-email', AuthController.sendTestEmail);


// profile routes (private routes)
router.get("/profile", authMiddleware, ProfileController.index); // get current user profile data
router.put("/profile/:id", authMiddleware, ProfileController.update); // update profile image

//news routes
//public routes
router.get("/news/get", NewsController.getNews); // get all news
// router.get("/news/get", redisCache.route(), NewsController.getNews); // get all news

router.get("/news/get/:id", NewsController.getSingleNews); // get news by id
//private routes
router.post("/news/create", authMiddleware, NewsController.createNews); //add news
router.put("/news/update/:id", authMiddleware, NewsController.updateNews); // update news
router.delete("/news/delete/:id", authMiddleware, NewsController.deleteNews); // delete news



export default router;
