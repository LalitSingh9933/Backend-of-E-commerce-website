import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

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
  categoryId
}) => {

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });
  if (!category || !category.isActive) {
    throw new ApiError(404, "Category not found");
  }
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
      categoryId
    },
    include: {
      category: true
    }
  });
};
export const getAllProductsService = async () => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      category: true
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
    include:{
      category:true,
    }
  });

  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found");
  }

  return product;
};
export const upataProductService = async (
  productId,
  data
) => {
  const id = Number(productId);
  if (Number.isNaN(id)) {
    throw new ApiError(400, "Invalid product ID");
  }
  const existingProduct = await prisma.product.findUnique({
    where: {
      id,
    },
  });
  if (!existingProduct) {
    throw new ApiError(404, " Product  not found");
  }
  if (data.categoryId !== undefined) {
    const category = await prisma.category.findUnique({
      where: {
        id: data.categoryId,
      },
    });

    if (!category || !category.isActive) {
      throw new ApiError(404, "Category not found");
    }
  }

  const updataData = {
    ...data,
  };

  // regenerate slug after product name change

  if (data.name && data.name !== existingProduct.name) {
    let slug = createSlug(data.name);

    const existingSlug = await prisma.product.findUnique({
      where: {
        slug,
      },
    });
    if (existingSlug && existingSlug.id !== id) {
      slug = `${slug}-${DataTransfer.now()}`;
    }
    updataData.slug = slug;
  }

  return prisma.product.update({
    where: {
      id,
    },
    data: updataData,
  });

};

export const deleteProductService = async (productId) => {
  const id = Number(productId);

  if (Number.isNaN(id)) {
    throw new ApiError(400, "Invalid product ID");
  }
  const product = await prisma.product.findUnique({
    where: {
      id,

    },
  });
  if (!product) {
    throw new ApiError(404, "Podcut not found");
  }
  await prisma.product.delete({
    where: {
      id,
    },
  });
  return product;
}