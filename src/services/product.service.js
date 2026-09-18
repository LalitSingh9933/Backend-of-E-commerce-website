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
export const getAllProductsService = async (query) => {

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(
    Math.max(Number(query.limit) || 12, 1),
    100
  );

  const skip = (page - 1) * limit;

  const search = query.search?.trim();
  const category = query.category?.trim();

  const minPrice = Number(query.minPrice);
  const maxPrice = Number(query.maxPrice);

  // sorting
  let orderBy = {
    createdAt: "desc",
  };

  if (query.sort === "price_asc") {
    orderBy = {
      price: "asc",
    };
  }

  if (query.sort === "price_desc") {
    orderBy = {
      price: "desc",
    };
  }

  if (query.sort === "oldest") {
    orderBy = {
      createdAt: "asc",
    };
  }

  const where = {
    isActive: true,

    ...(search && {
      OR: [
        {
          name: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
      ],
    }),
  
    ...(category && {
      category: {
        slug: category,
      },
    }),

    ...((!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) && {
      price: {
        ...(!Number.isNaN(minPrice) && {
          gte: minPrice,
        }),

        ...(!Number.isNaN(maxPrice) && {
          lte: maxPrice,
        }),
      },
    }),
  };
  const [products, totalProducts] = await prisma.$transaction([
    prisma.product.findMany({
      where,

      include: {
        category: true,
      },

      orderBy,
      
      skip,
      take: limit,
    }),

    prisma.product.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(totalProducts / limit);

  return {
    products,

    pagination: {
      page,
      limit,
      totalProducts,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };

};
export const getProductBySlugService = async (slug) => {
  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    include: {
      category: true,
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
};
