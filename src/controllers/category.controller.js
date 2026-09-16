import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createCategoryService,getAllCategoriesService,getCategoryBySlugService ,updateCategoryService,deleteCategoryService} from "../services/category.service.js";

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
export const  updateCategory = asyncHandler (async(req,res)=>{
  const category = await updateCategoryService(
    req.params.id,
    req.body
  );
  return res.status(200).json(
    new ApiResponse(
      200,
      "Category updated successfully",
      category
    )
  )
});
export const deleteCategory = asyncHandler (async( req, res) =>{
  await deleteCategoryService (req.params.id);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Category deleted successfully"
    )
  );
});