
const Product = require("../models/Product");
const Store = require("../models/Store");


const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof category !== "string" ||
      !name.trim() ||
      !description.trim() ||
      !category.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and category are required",
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === "" ||
      typeof price === "boolean" ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid number greater than zero",
      });
    }

    if (
      stock !== undefined &&
      (typeof stock === "boolean" ||
        stock === "" ||
        !Number.isInteger(Number(stock)) ||
        Number(stock) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative integer",
      });
    }

    const store = await Store.findOne({
      sellerId: req.user.userId,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Create your store before adding products",
      });
    }

    if (store.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Activate your store before adding products",
      });
    }
    const imageUrl = req.file?.path || "";
const imagePublicId = req.file?.filename || "";
    const product = await Product.create({
      storeId: store._id,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      stock: stock === undefined ? 0 : Number(stock),
      category: category.trim(),
      image: imageUrl,
imagePublicId: imagePublicId,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create product error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const getMyProducts = async (req, res) => {
  try {
    const store = await Store.findOne({
      sellerId: req.user.userId,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const products = await Product.find({
      storeId: store._id,isDeleted: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get my products error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Generate a consistent shuffle value for each product and seed
const getShuffleHash = (value) => {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};


const getPublicProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {
      status: "active",
      isDeleted: false,
    };

    // Pagination
    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    // Shuffle seed
    const shuffleSeed = String(
      req.query.seed || "default"
    ).slice(0, 100);

    // Get active stores
    const activeStores = await Store.find({
      status: "active",
    }).select("_id");

    const activeStoreIds = activeStores.map(
      (store) => store._id
    );

    // Search with category priority
    const normalizedSearch = search?.trim().toLowerCase();

    if (normalizedSearch) {
      // Check whether search matches an active product category
      const matchingCategory = await Product.exists({
        status: "active",
        isDeleted: false,
        storeId: { $in: activeStoreIds },
        category: normalizedSearch,
      });

      if (matchingCategory) {
        // Exact category match
        filter.category = normalizedSearch;
      } else {
        // Search product name and description
        const searchRegex = new RegExp(
          normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i"
        );

        filter.$or = [
          { name: searchRegex },
          { description: searchRegex },
        ];
      }
    }

    // Apply selected category filter
    if (category?.trim()) {
      filter.category = category.trim().toLowerCase();
    }

    const publicFilter = {
      ...filter,
      storeId: { $in: activeStoreIds },
    };

    // Fetch all matching products
    const products = await Product.find(publicFilter).populate({
      path: "storeId",
      match: { status: "active" },
      select: "storeName",
    });

    // Exclude products without an active populated store
    const activeProducts = products.filter(
      (product) => product.storeId !== null
    );

    // Apply deterministic shuffle using the same seed
    activeProducts.sort((a, b) => {
      const hashA = getShuffleHash(`${shuffleSeed}-${a._id}`);
      const hashB = getShuffleHash(`${shuffleSeed}-${b._id}`);

      if (hashA === hashB) {
        return String(a._id).localeCompare(String(b._id));
      }

      return hashA - hashB;
    });

    // Calculate count and pagination
    const totalProducts = activeProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);

    // Apply pagination after shuffling
    const paginatedProducts = activeProducts.slice(
      skip,
      skip + limit
    );

    return res.status(200).json({
      success: true,
      count: paginatedProducts.length,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
      },
      products: paginatedProducts,
    });

  } catch (error) {
    console.error(
      "Get public products error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};





const getProductCategories = async (req, res) => {
  try {
    const activeStores = await Store.find({
      status: "active",
    }).select("_id");

    const activeStoreIds = activeStores.map(
      (store) => store._id
    );

    const categories = await Product.distinct("category", {
      status: "active",
      isDeleted: false,
      storeId: { $in: activeStoreIds },
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories: categories.sort((a, b) =>
        a.localeCompare(b)
      ),
    });
  } catch (error) {
    console.error("Get product categories error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      status: "active",
      isDeleted: false,
    }).populate({
      path: "storeId",
      match: { status: "active" },
      select: "storeName description",
    });

    if (!product || !product.storeId) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product by ID error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, price, stock, category } = req.body;

    if (!/^[a-fA-F0-9]{24}$/.test(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "stock",
      "category",
    ];

    const updates = Object.keys(req.body);

    if (
      updates.length === 0 ||
      updates.some((field) => !allowedFields.includes(field))
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide valid product fields to update",
      });
    }

    if (
      name !== undefined &&
      (typeof name !== "string" || !name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Product name must be a non-empty string",
      });
    }

    if (
      description !== undefined &&
      (typeof description !== "string" || !description.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a non-empty string",
      });
    }

    if (
      category !== undefined &&
      (typeof category !== "string" || !category.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Category must be a non-empty string",
      });
    }

    if (
      price !== undefined &&
      (typeof price === "boolean" ||
        price === "" ||
        !Number.isFinite(Number(price)) ||
        Number(price) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than zero",
      });
    }

    if (
      stock !== undefined &&
      (typeof stock === "boolean" ||
        stock === "" ||
        !Number.isInteger(Number(stock)) ||
        Number(stock) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative integer",
      });
    }

    const store = await Store.findOne({
      sellerId: req.user.userId,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      storeId: store._id,
      isDeleted: false,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found in your store",
      });
    }

    if (name !== undefined) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (category !== undefined) product.category = category.trim();
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update product error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const updateProductStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const { status } = req.body;

    if (!/^[a-fA-F0-9]{24}$/.test(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

   if (
  typeof status !== "string" ||
  !["active", "inactive"].includes(status)
) {
  return res.status(400).json({
    success: false,
    message: "Status must be active or inactive",
  });
}

    const store = await Store.findOne({
      sellerId: req.user.userId,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      storeId: store._id,
      isDeleted: false,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found in your store",
      });
    }

    product.status = status;
    await product.save();

    return res.status(200).json({
      success: true,
      message: `Product ${status} successfully`,
      product: {
        id: product._id,
        name: product.name,
        status: product.status,
      },
    });
  } catch (error) {
    console.error("Update product status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const store = await Store.findOne({
      sellerId: req.user.userId,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      storeId: store._id,
      isDeleted: false,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found in your store",
      });
    }

    product.isDeleted = true;
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports = { createProduct, getMyProducts,  getPublicProducts,getProductCategories, getProductById,updateProduct,updateProductStatus, deleteProduct, };
