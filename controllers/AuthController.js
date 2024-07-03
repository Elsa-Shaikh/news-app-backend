import vine, { errors } from "@vinejs/vine";
import prisma from "../DB/db.config.js";
import { loginSchema, registerSchema } from "../validations/AuthValidation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../config/mailer.js";
import logger from "../config/logger.js";
import { emailQueue, emailQueueName } from "../job/emailJob.js";

class AuthController {
  static async register(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);
      // check email
      const findUser = await prisma.users.findUnique({
        where: {
          email: payload?.email,
        },
      });
      if (findUser) {
        return res.status(400).json({
          status: 400,
          errors: {
            email: "Email Already Exists! Please use another one!",
          },
        });
      }

      // encrypt the password
      const salt = bcrypt.genSaltSync(10);
      payload.password = bcrypt.hashSync(payload.password, salt);

      const user = await prisma.users.create({
        data: payload,
      });

      return res.json({
        status: 200,
        success: true,
        message: "User Created Successfully!",
        user,
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

  static async login(req, res) {
    try {
      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(req.body);

      //check email
      const findUser = await prisma.users.findUnique({
        where: {
          email: payload?.email,
        },
      });
      if (findUser) {
        if (!bcrypt.compareSync(payload?.password, findUser?.password)) {
          return res.status(404).json({
            status: 404,
            success: false,
            error: { message: "Invalid Credentials!" },
          });
        }
        // generate taken
        const payloadData = {
          id: findUser?.id,
          email: findUser?.email,
          profile: findUser?.profile,
          name: findUser?.name,
        };
        const token = jwt.sign(payloadData, process.env.JWTSECRET, {
          expiresIn: "30d",
        });
        return res.status(200).json({
          message: "Login Successfully!",
          access_token: `Bearer ${token}`,
        });
      }

      return res.status(404).json({
        status: 404,
        success: false,
        error: { message: "No User Found!" },
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

  // send test email
  static async sendTestEmail(req, res) {
    try {
      const { email } = req.query;
      // const payload = {
      //   toEmail: email,
      //   subject: "Testing Email!",
      //   body: "<h1>Hello World </h1>",
      // };
      const payload = [
        {
          toEmail: email,
          subject: "Testing Email!",
          body: "<h1>Hello World </h1>",
        },
        {
          toEmail: email,
          subject: "Testing Email 2!",
          body: "<h1>Hello Testing! </h1>",
        },
      ];
      await emailQueue.add(emailQueueName, payload);
      // await sendEmail(payload.toEmail, payload.subject, payload.body);
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Email Sent Successfully or Job Added Successfully!!",
      });
    } catch (error) {
      console.log("Error!: ", error);
      logger.error({
        type: "Email Error!",
        body: error,
      });
      res.status(500).json({
        status: 500,
        success: false,
        message: "Internal Server Error!",
      });
    }
  }
}

export default AuthController;
