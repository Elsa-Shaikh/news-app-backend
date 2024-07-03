import prisma from "../DB/db.config.js";
import { generateUniqueNumber, imageValidator } from "../Utlis/helpers.js";

class ProfileController {
  static async index(req, res) {
    try {
      const user = req.user;
      return res.json({ status: 200, success: true, user });
    } catch (error) {
      console.log("Error: ", error);
      logger.error(error?.message);
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Something Went Wrong or Internal Server Error!",
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      if (!req?.files || Object.keys(req?.files).length === 0) {
        return res
          .status(400)
          .json({ status: 400, message: "Profile Image is Required!" });
      }

      const profile = req?.files?.profile;
      const message = imageValidator(profile?.size, profile?.mimetype);
      if (message !== null) {
        return res.status(400).json({ error: { message } });
      }

      const img_extension = profile?.name.split(".");
      const img_name = generateUniqueNumber() + "." + img_extension[1];
      const upload_path = process.cwd() + "/public/images/" + img_name;

      profile.mv(upload_path, (err) => {
        if (err) throw err;
      });

      await prisma.users.update({
        data: {
          profile: img_name,
        },
        where: {
          id: Number(id),
        },
      });

      // return res.json({
      //   name: profile?.name,
      //   size: profile?.size,
      //   mimeType: profile?.mimetype,
      // });

      return res.status(200).json({
        status: 200,
        success: true,
        message: "Profile Updated Successfully!",
      });
    } catch (error) {
      console.log("Error: ", error);
      logger.error(error?.message);
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Something Went Wrong or Internal Server Error!",
      });
    }
  }

  static async store() {}

  static async show() {}

  static async destroy() {}
}
export default ProfileController;
