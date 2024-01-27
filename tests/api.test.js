const request = require("supertest");

// Dummy Data to create blogs
const dummyBLogData = [
  {
    title: "Error Code: 2xx (Successful)",
    content:
      "The most common status code, indicating that the request was successful, and the server has returned the requested data. This is the standard response for successful HTTP requests.",
  },
  {
    title: "Error Code: 3xx (Redirection)",
    content:
      "301 Moved Permanently: This status code informs the client that the requested resource has been permanently moved to a new location. Subsequent requests should use the new URL. 302 Found (or 303 See Other): Similar to 301, this status code indicates that the requested resource has been temporarily moved. The client should use the new URL provided in the response. The distinction between 302 and 303 lies in how the client should handle the new URL. 304 Not Modified: This status code is used when the client's cached copy of a resource is still valid, and the server has not modified the resource since the last request. The server responds without sending the resource content, saving bandwidth.",
  },
  {
    title: "Error Code: 4xx (Client Error)",
    content:
      "400 Bad Request: This status code indicates that the server did not understand the request due to malformed syntax or invalid parameters in the client's request. 401 Unauthorized: The client needs to authenticate to get the requested response. This status code is commonly used when access to a resource requires proper authentication. 403 Forbidden: The server understood the request, but the client does not have permission to access the requested resource. 404 Not Found: Perhaps the most well-known status code, 404 indicates that the requested resource could not be found on the server. This often occurs when an endpoint or URL is incorrect.",
  },
  {
    title: "Error Code: 5xx (Server Error)",
    content:
      "500 Internal Server Error: This generic error message indicates that something unexpected went wrong on the server. It's a catch-all status code for server-side errors. 501 Not Implemented: The server lacks the functionality needed to fulfill the request. This status code is returned when the server does not recognize the request method. 502 Bad Gateway: This status code is often seen when a server acting as a gateway or proxy receives an invalid response from an upstream server. 503 Service Unavailable: The server is not ready to handle the request. It's commonly used when the server is undergoing maintenance or is temporarily overloaded.",
  },
  {
    title: "Error Code: 1xx (Server Error)",
    content:
      "This status code indicates that the server has received the initial part of the request and is signaling to the client that it should proceed with the rest of the request. It is often used when a server wants to acknowledge receipt of the request headers before receiving the request body.",
  },
];

// Some Constants
const USERAPI_BASEURL = "http://localhost:8000/api/user"; // User API Base url
const BLOGAPI_BASEURL = "http://localhost:8000/api/blog"; // Blog API Base url
let JWTTOKEN = undefined; // To store jwt token
const username = "nikhil25803"; // Global username for testing
const blogIDs = []; // Arrays to store blog data

describe("User Registration Test: /user", () => {
  // User registration test
  it("POST: /register", async () => {
    // Payload for registration
    const userData = {
      name: "Nikhil Raj",
      username: "nikhil25803",
      password: "nikhil1234",
      email: "nikhil25803@gmail.com",
    };
    const response = await request(USERAPI_BASEURL)
      .post("/register")
      .send(userData);
    expect(response.statusCode).toEqual(200);
    expect(response.body.message).toEqual("New User Created");
  });
});

// User login and operation test
describe("User login and operations test", () => {
  // Login test
  it("POST: /login", async () => {
    // Login Payload
    const loginData = {
      username: "nikhil25803",
      password: "nikhil1234",
    };
    const loginResponse = await request(USERAPI_BASEURL)
      .post("/login")
      .send(loginData);
    expect(loginResponse.statusCode).toEqual(200);
    expect(loginResponse.body.message).toEqual("User: nikhil25803 loggedin.");

    // Save token for future test
    JWTTOKEN = loginResponse.body.token;
  });

  // Fetch user details test
  it("GET: /:username", async () => {
    const userDetailsResponse = await request(USERAPI_BASEURL)
      .get(`/${username}`)
      .set({ Authorization: `Bearer ${JWTTOKEN}` });
    expect(userDetailsResponse.statusCode).toEqual(200);

    // Validate response body
    const userDetailsResponseBody = userDetailsResponse.body;
    expect(userDetailsResponseBody.message).toEqual("User data fetched");
    expect(userDetailsResponseBody.data.username).toEqual("nikhil25803");
    expect(userDetailsResponseBody.data.name).toEqual("Nikhil Raj");
    expect(userDetailsResponseBody.data.email).toEqual("nikhil25803@gmail.com");
  });

  it("GET: /:username/blog/all", async () => {
    const blogsByUserResponse = await request(USERAPI_BASEURL)
      .get(`/${username}/blog/all`)
      .set({ Authorization: `Bearer ${JWTTOKEN}` });
    expect(blogsByUserResponse.statusCode).toEqual(200);

    // Validate response body
    expect(blogsByUserResponse.body.message).toEqual(
      "All blogs written by the user has been fetched"
    );
  });
});

describe("Blog APIs Testing: /blog", () => {
  // Create blog test
  it("POST: /create", async () => {
    // Create multiple blogs for testing
    dummyBLogData.forEach(async (blog) => {
      const createBlogResponse = await request(BLOGAPI_BASEURL)
        .post("/create")
        .send(blog)
        .set({ Authorization: `Bearer ${JWTTOKEN}` });

      expect(createBlogResponse.statusCode).toEqual(200);
      expect(createBlogResponse.body.message).toEqual("New blog created");

      // Store blog id in collection for future use
      blogIDs.push(createBlogResponse.body.data.bid);
    });
  });

  // Get all blogs test
  it("GET: /all?page=1", async () => {
    const getAllBlogResponse = await request(BLOGAPI_BASEURL).get(
      "/all?page=1"
    );
    expect(getAllBlogResponse.statusCode).toEqual(200);

    // Validate response body
    const getAllBlogResponseBody = getAllBlogResponse.body;
    expect(getAllBlogResponseBody.message).toEqual(
      "All records has been fetched"
    );
    expect(getAllBlogResponseBody.data.length > 0).toEqual(true);
  });

  // Delete blog test
  it("DELETE: /delete?blogid={blogid}", async () => {
    const deleteBlogResponse = await request(BLOGAPI_BASEURL)
      .delete(`/delete?blogid=${blogIDs[0]}`)
      .set({ Authorization: `Bearer ${JWTTOKEN}` });
    expect(deleteBlogResponse.statusCode).toEqual(200);
    expect(deleteBlogResponse.body.message).toEqual("Blog has been deleted");
  });

  // Update a blog
  it("UPDATE: /update?blogid=65b57c19b35e631e53cd6000", async () => {
    const updateBlogResponse = await request(BLOGAPI_BASEURL)
      .put(`/update?blogid=${blogIDs[1]}`)
      .set({ Authorization: `Bearer ${JWTTOKEN}` });
    expect(updateBlogResponse.statusCode).toEqual(200);
    expect(updateBlogResponse.body.message).toEqual(
      "Blog has been updated successfully."
    );
  });

  // Read most viewed blog and check recommendations
  it("GET: ?mostviewed=true", async () => {
    const mostViewedBlogResponse = await request(BLOGAPI_BASEURL).get(
      "?mostviewed=true"
    );
    expect(mostViewedBlogResponse.statusCode).toEqual(200);

    // Validate response body
    const mostViewedBlogResponseData = mostViewedBlogResponse.body;
    expect(mostViewedBlogResponseData.message).toEqual(
      "Most popular blogs has been fetched"
    );
    expect(mostViewedBlogResponseData.recommendations.length >= 0).toEqual(
      true
    );
  });

  // Read specifi blog and check recommendations
  it("GET: ?blogid={blogid}", async () => {
    const specificBlogResponse = await request(BLOGAPI_BASEURL).get(
      `?blogid=${blogIDs[2]}`
    );
    expect(specificBlogResponse.statusCode).toEqual(200);

    // Validate response body
    const specificBlogResponseData = specificBlogResponse.body;
    expect(specificBlogResponseData.message).toEqual(
      "Blog data has been fetched."
    );
    expect(specificBlogResponseData.recommendations.length >= 0).toEqual(true);
  });

  // Test to fetch n blogs
  it("GET: /top/:n", async () => {
    const topNBlogResponse = await request(BLOGAPI_BASEURL).get("/top/2");
    expect(topNBlogResponse.statusCode).toEqual(200);

    // Validate response body
    const topNBlogResponseData = topNBlogResponse.body;
    expect(topNBlogResponseData.message).toEqual("Top blogs has been fetched");
    expect(topNBlogResponseData.data.length >= 0).toEqual(true);
  });

  // Keyword Based Search (title search)
  it("GET: /search?title={keyword}", async () => {
    const titleKeywordSearchResponse = await request(BLOGAPI_BASEURL).get(
      "/search?title=Code"
    );
    expect(titleKeywordSearchResponse.statusCode).toEqual(200);

    // Validate response body
    const titleKeywordSearchResponseData = titleKeywordSearchResponse.body;
    expect(titleKeywordSearchResponseData.message).toEqual(
      "Fetched blogs with title keyword: Code in title."
    );
    expect(titleKeywordSearchResponseData.data.length >= 0).toEqual(true);
  });

  // Keyword Based Search (content search)
  it("GET: /search?content={keyword}", async () => {
    const contentKeywordSearchResponse = await request(BLOGAPI_BASEURL).get(
      "/search?content=status"
    );
    expect(contentKeywordSearchResponse.statusCode).toEqual(200);

    // Validate response body
    const contentKeywordSearchResponseData = contentKeywordSearchResponse.body;
    expect(contentKeywordSearchResponseData.message).toEqual(
      "Fetched blogs with keyword: status in content."
    );
    expect(contentKeywordSearchResponseData.data.length >= 0).toEqual(true);
  });

  // Clear all records generated for test
  it("Clear all records", async () => {
    const resetResponse = await request("http://localhost:8000").get("/reset");
    expect(resetResponse.statusCode).toEqual(200);
  });
});
