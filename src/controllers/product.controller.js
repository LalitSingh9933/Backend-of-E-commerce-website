import {
    createProductService,
    getAllProductsService,
    getProductBySlugService,
    upataProductService,
    deleteProductService,
    getAllAdminProductsService,
    reactivateProductService,
} from "../services/product.service.js"
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";


export const createProcut = asyncHandler(async (req, res) => {
    const product = await createProductService(req.body);

    return res.status(201).json(
        new ApiResponse(
            201,
            "Product created successfully",
            product
        )
    );
});

export const getAllProducts = asyncHandler(async (req, res) => {
    const result = await getAllProductsService(req.query);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Poducts Fetched successfully",
            result
        )
    );
});

export const getproductBySlug = asyncHandler(async (req, res) => {

    const product = await getProductBySlugService(req.params.slug);
    return res.status(200).json(
        new ApiResponse(
            200,
            "Product fetched sucessfully ",
            product
        )
    );
});

export const updateProduct = asyncHandler(async (req, res) => {
    const product = await upataProductService(
        req.params.id,
        req.body
    );
    return res.status(200).json(
        new ApiResponse(
            200,
            "Product updated successfully",
            product
        )
    )
});

export const deleteProduct = asyncHandler(async (req, res) => {
    await deleteProductService(req.params.id);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Product deleted successfully"
        )
    )
});
export const getAllAdminProducts = asyncHandler(
    async (req, res) => {
        const result = await getAllAdminProductsService(req.query);

        return res.status(200).json(
            new ApiResponse(
                200,
                "Admin products fetched successfully",
                result
            )
        );
    }
);

export const reactivateProduct = asyncHandler(
    async (req, res) => {
        const product = await reactivateProductService(req.params.id);

        return res.status(200).json(
            new ApiResponse(
                200,
                "Product reactivated successfully",
                product
            )
        );
    }
);