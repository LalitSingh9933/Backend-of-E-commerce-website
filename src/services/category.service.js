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

export const createCategoryService = async ({
  name,
  description,
}) => {
  let slug = createSlug(name);

  const existingCategory = await prisma.category.findUnique({
    where: {
      slug,
    },
  });

  if (existingCategory) {
    throw new ApiError(
      409,
      "Category already exists"
    );
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
    },
  });

  return category;
};

export const getAllCategoriesService = async () => {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },

    orderBy: {
      name: "asc",
    },

    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return categories;
};

export const getCategoryBySlugService = async (slug) => {
  const category = await prisma.category.findUnique({
    where: {
      slug,
    },

    include: {
      products: {
        where: {
          isActive: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!category || !category.isActive) {
    throw new ApiError(404, "Category not found");
  }

  return category;
};
export const updateCategoryService = async (categoryId, data) => {
  const id = Number(categoryId);
  if (Number.isNaN(id)) {
    throw new ApiError(400, " Invalid category ID");
  }

  const existingCategory = await prisma.category.findUnique({
    where: { id },

  });

  if (!existingCategory) {
    throw new ApiError(404, "Category not found");

  }
  const updateData = {
    ...data,
  };
  //if category name change , generate a new slug of it.

  if (data.name && data.name !== existingCategory.name) {
     const slug = createSlug(data.name);

     const categoryWithSlug  = await prisma.category.findUnique({
      where: {slug},
     });

     if(categoryWithSlug && categoryWithSlug.id !== id){
      throw new ApiError(
         409,
         "A category with this name already exists"
      );
     }

     updateData.slug = slug;
  }

  return prisma.category.update({
    where: {id},
    data: updateData,
  });
};
export const deleteCategoryService = async (categoryId) => {
  const id = Number(categoryId);

  if(Number.isNaN(id)){
    throw new ApiError(400, "Invalid category ID");
  }

  const category = await prisma.category.findUnique({
    where:{id},
  });
  if(!category){
    throw new ApiError(404, "Category not found");
  }

  await prisma.category.delete({
    where:{id},
  });
  return category;
};