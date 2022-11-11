import { types } from "energylib";
import server from "../index";
import request from "supertest";

const bankDeposit: types.BankAction = {
  transactionHash: "abc",
  amount: 10,
  createdAt: "today",
  type: "Deposit",
};

afterAll((done) => {
  server.close(() => {
    done();
  });
});

describe("POST /api/transactions ", () => {
  test("It should respond with a 200 status code", async () => {
    const response = await request(server)
      .post("/api/transactions")
      .send(bankDeposit);
    expect(response.statusCode).toBe(200);
  });
});

describe("GET /api/transactions", () => {
  test("It should respond with a list of previously added items", async () => {
    const response = await request(server).get("/api/transactions");
    expect(response.body).toEqual([bankDeposit]);
    expect(response.statusCode).toBe(200);
  });
});
