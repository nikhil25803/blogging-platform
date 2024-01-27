import natural from "natural";
import { prisma } from "../db/dbConfig.js";

// Create a new TF-IDF vectorizer instance
const TFIDFObject = natural.TfIdf;
const tfidf = new TFIDFObject();

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

export const blogsRecommendation = async (blogid) => {
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
    console.log(currentDocumentVector);

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
