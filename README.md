## Blogging Platform API

The Blogging Platform API utilizes a microservices architecture with NodeJS, Express.js, Postgres, and Redis, facilitating CRUD operations, authentication, keyword search, and recommendation features. It emphasizes performance optimization, security measures, and scalability via Docker orchestration and thorough unit testing.

## Tech Stacks

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

## Microservices Architecture

A microservices architecture leveraging Docker containers orchestrates `PostgreSQL`, `Node.js API`, and `Redis` instances for scalable and modular application development.

<div style="display: flex; justify-content: center;">
    <img src="https://github.com/nikhil25803/blogging-platform/assets/93156825/24cefc60-b6d6-4ec3-8f1c-a02afb38005e" alt="Project Architecture">
</div>

## Features

- Token-based authentication and authorization for users.
- CRUD operation on blogs.
- Endpoint to retrieve the **latest N blog posts**, with N being a configurable parameter.
- A search functionality that allows users to **search** for blog posts based on **keywords in the title or content**.
- A feature to track and return the **most popular blog posts** based on the number of views.
- Implemented a feature that **recommends related blog** posts based on the content of the currently viewed post based on the `cosine similarity` concept.
- Added middleware to **compress API responses** for improved performance.
- Optimized database queries for efficiency and considered **asynchronous processing** where applicable.
- Wrote **comprehensive unit tests** covering the new features and algorithms
- Implemented advanced security measures such as **rate limiting**, **request validation**, and protection against common web vulnerabilities.

## Project setup

### Clone the repository

```bash
https://github.com/nikhil25803/blogging-platform
```

### Configure environment variables

Add a `.env` and add values mentioned in `.env.template`

```bash
PORT=...
JWT_ACCESS_TOKEN=...
REDIS_HOST=...
REDIS_PORT=...
POSTGRESDB_USER=...
POSTGRESDB_ROOT_PASSWORD=...
POSTGRESDB_DATABASE=...
POSTGRESDB_LOCAL_PORT=...
POSTGRESDB_DOCKER_PORT=...
DATABASE_URL=postgresql://{USER}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}
```

### Using Docker

- Start up the services

  ```bash
  docker-compose up
  ```

- Stop and remove the containers created

  ```bash
  docker-compose down --rmi all
  ```

- You can now access the server on `localhost:8000`

### Manual

- Install dependencies

  ```bash
  npm i
  ```

- Migrate schema to database using prisma

  ```bash
  npx prisma migrate dev --name init
  ```

- **Note** - Make sure the DB and Redis are running properly, and make changes in the `.env` file properly.

- Run test
  This command will run and test all the API endpoints. Will clear and reset the database

  ```bash
  npm run test
  ```

- Run the server

  ```
  npm run dev
  ```

## Recommendation Engine

A simplified approach using TF-IDF (Term Frequency-Inverse Document Frequency) for content analysis and **cosine similarity** for finding related posts. This approach is a common and relatively straightforward method for content-based recommendation.

A glimpse into code used to generate content-based recommendations.

```js
// Function to calculate cosine similarity between two vectors
const cosineSimilarity = (vectorA, vectorB) => {
  // Calculate dot product
  const dotProduct = Object.keys(vectorA).reduce((acc, term) => {
    if (vectorB[term]) {
      acc += vectorA[term] * vectorB[term];
    }
    return acc;
  }, 0);

  // Calculate Euclidean norms
  const normA = Math.sqrt(
    Object.values(vectorA).reduce((acc, val) => acc + val ** 2, 0)
  );
  const normB = Math.sqrt(
    Object.values(vectorB).reduce((acc, val) => acc + val ** 2, 0)
  );

  // Calculate cosine similarity
  const similarity = dotProduct / (normA * normB);

  return similarity;
};

const blogsRecommendation = async (blogid) => {
  // Fetch content of current blogs
  const blogData = await prisma.blog.findFirst({
    where: {
      bid: blogid,
    },
  });

  // Get content of the blog
  const blogContent = blogData.content.toLowerCase();

  // Current post vector data
  tfidf.addDocument(blogContent, -1);

  const cuurentBlogVector = tfidf.documents[0];

  // Get content of all existing blogs except current blog
  const existingBLogsData = await prisma.blog.findMany({
    where: {
      bid: {
        not: blogid,
      },
    },
  });

  // List to store recommended blogs based on cosine similarity calculation
  const recommendedBLogs = [];

  existingBLogsData.forEach((blog, index) => {
    tfidf.addDocument(blog.content, index);
    const currentDocumentVector = tfidf.documents[index + 1];

    // Calculate cosine similarity
    const cosineSimilarityValue = cosineSimilarity(
      cuurentBlogVector,
      currentDocumentVector
    );

    // Add blog in recommendation blog in this list if cosine score is > 0.2
    if (cosineSimilarityValue >= 0.2) {
      recommendedBLogs.push(blog);
    }
  });

  return recommendedBLogs;
};
```
