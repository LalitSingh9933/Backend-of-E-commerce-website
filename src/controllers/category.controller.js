import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createCategoryService,getAllCategoriesService,getCategoryBySlugService} from "../services/category.service.js";

export const createCategory = asyncHandler (
     async(req,res)=>{
        const category = await createCategoryService(req.body);

        return res.status(201).json(
            new ApiResponse(
                201,
                "Category created successfully",
                category
            )
        );
     }
);

export const getAllCategories = asyncHandler(
  async (req, res) => {
    const categories = await getAllCategoriesService();

    return res.status(200).json(
      new ApiResponse(
        200,
        "Categories fetched successfully",
        categories
      )
    );
  }
);

export const getCategoryBySlug = asyncHandler(
  async (req, res) => {
    const category = await getCategoryBySlugService(
      req.params.slug
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Category fetched successfully",
        category
      )
    );
  }
);