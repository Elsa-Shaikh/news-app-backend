import { Queue, Worker } from "bullmq";
import { defaultQueue, redisConnection } from "../config/queue.js";
import logger from "../config/logger.js";
import { sendEmail } from "../config/mailer.js";

export const emailQueueName = "email-queue";
export const emailQueue = new Queue(emailQueueName, {
  connection: redisConnection,
  defaultJobOptions: defaultQueue,
});

//workers
export const handler = new Worker(
  emailQueueName,
  async (job) => {
    console.log("The email worker data is : ", job.data);
    const data = job.data;
    data.map(async (item) => {
      await sendEmail(item.toEmail, item.subject, item.body);
    });
  },
  { connection: redisConnection }
);

// worker listener
handler.on("completed", (job) => {
  logger.info({
    job: job,
    message: "Job Done!",
  });
  console.log(`The job ${job.id} is completed!`);
});
handler.on("failed", (job) => {
  logger.error({
    job,
    message: "Job Failed!",
  });
  console.log(`The job ${job.id} is failed!`);
});
