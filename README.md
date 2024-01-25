# Blogging Platform API

Design and implementation of a more complex system for a blogging platform. With features like caching, rate-limiting, data modelling and some algorithmic features as well.

# TODOs

- Users (CRUD)
- Blog (CRUD)
- Database POSTGRESQL
- ORM PRISMA
- Caching Redis
- Advanced API Endpoints:
  - Create an endpoint to retrieve the latest N blog posts, with N being a configurable parameter.
  - Implement a search functionality that allows users to search for blog posts based on keywords in the title or content.
  - Add a feature to track and return the most popular blog posts based on the number of views.
- Data modelling and entitty relationship
- Algorithmic Challenge:
  - Implement a feature that recommends related blog posts based on the content of the currently viewed post.
  - Optimize the algorithm for recommending related posts to ensure it scales well.
- Middleware and Performance:
  - Implement middleware to compress API responses for improved performance.
  - Optimize database queries for efficiency and consider asynchronous processing where applicable.
- Security:
  - Implement advanced security measures such as rate limiting, request validation, and protection against common web vulnerabilities.
- Testing:
  - Write comprehensive unit tests covering the new features and algorithms.
  - Include tests for performance under various scenarios.
