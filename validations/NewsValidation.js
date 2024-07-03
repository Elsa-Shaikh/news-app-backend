import vine from "@vinejs/vine";
import { CustomErrorReporter } from "./CustomError.js";

//custom error
vine.errorReporter = () => new CustomErrorReporter();

export const newsSchema = vine.object({
  title: vine.string().minLength(5).maxLength(190),
  content: vine.string().minLength(10).maxLength(300000),
});
