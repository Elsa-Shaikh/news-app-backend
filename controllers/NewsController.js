import vine, { errors } from "@vinejs/vine";
import { newsSchema } from "../validations/NewsValidation.js";
import { imageValidator, removeImage, uploadImage } from "../Utlis/helpers.js";
import prisma from "../DB/db.config.js";
import NewsApiTransform from "../transform/new_image_url_transform.js";
import logger from "../config/logger.js";

class NewsController {
  static async getNews(req, res) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 1;

      if (page <= 0) {
        page = 1;
      }

      if (limit <= 0 || limit > 100) {
        limit = 10;
      }

      const skip = (page - 1) * limit;

      const news = await prisma.news.findMany({
        skip: skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: true,
            },
          },
        },
      });
      const transform = news?.map((item) => NewsApiTransform.transform(item));
      const count = await prisma.news.count();
      const total_pages = Math.ceil(count / limit);
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Fetched All News Successfully!",
        metadata: {
          count,
          currentPage: page,
          currentLimit: limit,
          totalPages: total_pages,
        },
        news: transform,
        // news,
      });
    } catch (error) {
      console.log("Error: ", error);
      logger.error(error?.message);
      return res.status(200).json({
        status: 500,
        success: false,
        message: "Internal Server Error!",
      });
    }
  }

  static async getSingleNews(req, res) {
    try {
      const { id } = req.params;
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: true,
            },
          },
        },
      });
      const transform = news ? NewsApiTransform.transform(news) : null;
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Fetched Single News Successfully!",
        news: transform,
      });
    } catch (error) {
      console.log("Error: ", error);
      logger.error(error?.message);
      return res.status(200).json({
        status: 500,
        success: false,
        message: "Internal Server Error!",
      });
    }
  }

  static async createNews(req, res) {
    try {
      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(req.body);
      if (!req.files || Object.keys(req.files).length === 0) {
        return res
          .status(400)
          .json({ status: 400, message: "News Image is Required!" });
      }

      const image = req.files.image;
      //image custom validator
      const message = imageValidator(image?.size, image?.mimetype);
      if (message !== null) {
        return res.status(400).json({ error: { message } });
      }

      const img_name = uploadImage(image);

      payload.image = img_name;
      payload.user_id = req.user.id;
      const news = await prisma.news.create({
        data: payload,
      });

      // remove cache
      // redisCache.del("/api/news",(err)=>{
      // if(err) throw err});

      return res.status(200).json({
        status: 200,
        success: true,
        message: "News Created Successfully!",
        news,
      });
    } catch (error) {
      console.log("Error: ", error);
      logger.error(error?.message);
      if (error instanceof errors.E_VALIDATION_ERROR) {
        console.log(error.messages);
        return res.status(400).json({ error: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          success: false,
          message: "Something Went Wrong or Internal Server Error!",
        });
      }
    }
  }

  static async updateNews(req, res) {
    try {
      const { id } = req.params;
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (req.user.id !== news.user_id) {
        return res
          .status(401)
          .json({ status: 401, success: false, message: "UnAuthorized!" });
      }

      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(req.body);
      const image = req?.files?.image;

      if (image) {
        const message = imageValidator(image?.size, image?.mimetype);
        if (message !== null) {
          return res.status(400).json({ error: { message } });
        }
        //upload a new image
        const imageName = uploadImage(image);
        payload.image = imageName;

        //delete old image
        removeImage(news?.image);
      }
      const newsUpdated = await prisma.news.update({
        data: payload,
        where: {
          id: Number(id),
        },
      });
      return res.status(200).json({
        status: 200,
        success: true,
        message: "News Updated Successfully!",
        news: newsUpdated,
      });
    } catch (error) {
      logger.error(error?.message);
      console.log("Error: ", error);
      if (error instanceof errors.E_VALIDATION_ERROR) {
        console.log(error.messages);
        return res.status(400).json({ error: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          success: false,
          message: "Something Went Wrong or Internal Server Error!",
        });
      }
    }
  }

  static async deleteNews(req, res) {
    try {
      const { id } = req.params;
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (req.user.id !== news.user_id) {
        return res
          .status(401)
          .json({ status: 401, success: false, message: "UnAuthorized!" });
      }

      // delete image from file system
      removeImage(news?.image);

      await prisma.news.delete({
        where: {
          id: Number(id),
        },
      });

      return res.status(200).json({
        status: 200,
        success: false,
        message: "News Deleted Successfully!",
      });
    } catch (error) {
      logger.error(error?.message);
      console.log("Error: ", error);
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Something Went Wrong or Internal Server Error!",
      });
    }
  }
}

export default NewsController;
