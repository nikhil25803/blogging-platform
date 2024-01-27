const request = require("supertest");

// Base URL
const BASEURL = "http://localhost:8000";

describe("Ping test", () => {
  it("GET: /", async () => {
    const response = await request(BASEURL).get("/");
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      message: "Server is up and running",
    });
  });
});
