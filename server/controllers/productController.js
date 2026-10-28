
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

    const product = await Product.create({
      storeId: store._id,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      stock: stock === undefined ? 0 : Number(stock),
      category: category.trim(),
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

const getPublicProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

const filter = {
  status: "active",
  isDeleted: false,
};

if (search) {
  filter.name = {
    $regex: search,
    $options: "i",
  };
}



if (category) {
  filter.category = category;
}

const page = Math.max(1, parseInt(req.query.page, 10) || 1);
const limit = Math.min(
  50,
  Math.max(1, parseInt(req.query.limit, 10) || 10)
);
const skip = (page - 1) * limit;

const activeStores = await Store.find({
  status: "active",
}).select("_id");

const activeStoreIds = activeStores.map(
  (store) => store._id
);

const publicFilter = {
  ...filter,
  storeId: { $in: activeStoreIds },
}

    const products = await Product.find(publicFilter)
      .populate({
        path: "storeId",
        match: { status: "active" },
        select: "storeName",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
  .limit(limit);



    const activeProducts = products.filter(
      (product) => product.storeId !== null
    );

    const totalProducts = await Product.countDocuments(publicFilter);
const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      count: activeProducts.length,
      pagination: {
    totalProducts,
    totalPages,
    currentPage: page,
    limit,
  },
      products: activeProducts,
    });
  } catch (error) {
    console.error("Get public products error:", error.message);

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


module.exports = { createProduct, getMyProducts,  getPublicProducts, getProductById,updateProduct,updateProductStatus, deleteProduct, };
