import prisma from "../config/prisma.js";

const createSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const createProductService = async ({
  name,
  description,
  price,
  stock,
  image,
}) => {
  let slug = createSlug(name);

  const existingProduct = await prisma.product.findUnique({
    where: { slug },
  });

  if (existingProduct) {
    slug = `${slug}-${Date.now()}`;
  }

  return prisma.product.create({
    data: {
      name,
      slug,
      description,
      price,
      stock,
      image,
    },
  });
};
export const getAllProductsService = async () => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return products;
};
export const getProductBySlugService = async (slug) => {
  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
  });

  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found");
  }

  return product;
};