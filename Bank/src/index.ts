require("dotenv").config({ debug: process.env.DEBUG });
import express, { Request, Response, Application } from "express";
import { transactionRouter } from "./routers/transaction";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/transactions", transactionRouter);

app.get("/", (_: Request, res: Response) => res.send("Bank"));

const server = app.listen(process.env.PORT, () => {
  console.log(
    `\nServer is running at ${process.env.APP_DOMAIN}:${process.env.PORT}`
  );
});

export default server;
