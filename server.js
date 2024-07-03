import express from "express";
import ApiRoutes from "./routers/api.js";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import cors from "cors";
import { limiter } from "./config/rateLimit.js";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 8002;

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(fileUpload());
app.use(helmet());
app.use(cors());
app.use(limiter);

app.get("/", (req, res) => {
  return res.json({ message: "Hello! yes it is working!" });
});

//routes
app.use("/api", ApiRoutes);

//logger
// logger.info("Hey, I am just testing!")

//Queue
import "./job/index.js";

app.listen(port, () => console.log(`Server is running on PORT ${port}`));
