const mongoose = require("mongoose");
const User = require("../models/User");
// const Store = require("../models/Store");
const Product = require("../models/Product");
const Order = require("../models/Order");
const SellerApplication = require("../models/SellerApplication");
// Get admin dashboard statistics

const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      pendingSellerApplications,
      pendingOrders,
      pendingReturnRequestsResult,
    ] = await Promise.all([
      // Exclude admin accounts from marketplace user count
      User.countDocuments({ role: { $ne: "admin" } }),

      // Count approved seller accounts
      User.countDocuments({ role: "seller" }),

      // Exclude soft-deleted products
      Product.countDocuments({ isDeleted: { $ne: true } }),

      // Count all orders
      Order.countDocuments(),

      // Count pending seller applications
      SellerApplication.countDocuments({ status: "pending" }),

      // Count orders that are still placed
      Order.countDocuments({ status: "placed" }),

      // Count individual pending return requests
      Order.aggregate([
        { $unwind: "$items" },
        { $match: { "items.returnStatus": "requested" } },
        { $count: "total" },
      ]),
    ]);

    const pendingReturnRequests =
      pendingReturnRequestsResult[0]?.total || 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        pendingSellerApplications,
        pendingOrders,
        pendingReturnRequests,
      },
    });
  } catch (error) {
    console.error("Admin dashboard stats error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};


// Get all marketplace users with search, filter and pagination
const getAdminUsers = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const search = req.query.search?.trim() || "";
    const role = req.query.role || "all";

    // Only buyer and seller accounts are manageable here
    const filter = {
      role: { $in: ["buyer", "seller"] },
    };

    // Role filter
    if (role === "buyer" || role === "seller") {
      filter.role = role;
    } else if (role !== "all") {
      return res.status(400).json({
        success: false,
        message: "Invalid role filter",
      });
    }

    // Search by name or email
    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const searchRegex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit,
      },
    });
  } catch (error) {
    console.error("Get admin users error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

const getAdminProducts = async (req, res) => {
  try {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const search = req.query.search?.trim() || "";
    const category = req.query.category?.trim() || "";
    const status = req.query.status || "all";

    // Exclude soft-deleted products
    const filter = {
      isDeleted: { $ne: true },
    };

    // Search by product name
    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.name = {
        $regex: escapedSearch,
        $options: "i",
      };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Product status filter
    if (status === "active" || status === "inactive") {
      filter.status = status;
    } else if (status !== "all") {
      return res.status(400).json({
        success: false,
        message: "Invalid product status filter",
      });
    }

    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate({
          path: "storeId",
          select: "storeName",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        limit,
      },
    });
  } catch (error) {
    console.error("Get admin products error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// Update product status (active / inactive)
const updateAdminProductStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product status",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isDeleted: { $ne: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.status = status;
    await product.save();

    return res.status(200).json({
      success: true,
      message: `Product ${status === "active" ? "activated" : "deactivated"} successfully`,
      product,
    });
  } catch (error) {
    console.error("Admin update product status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update product status",
    });
  }
};


// Soft delete product
const deleteAdminProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      isDeleted: { $ne: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isDeleted = true;
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete product error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};


const getAdminOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const search = req.query.search?.trim() || "";
    const status = req.query.status || "all";
    const paymentStatus = req.query.paymentStatus || "all";

    const allowedStatuses = [
      "placed",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    const allowedPaymentStatuses = [
      "pending",
      "paid",
      "failed",
      "refunded",
    ];

    if (
      status !== "all" &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    if (
      paymentStatus !== "all" &&
      !allowedPaymentStatuses.includes(paymentStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const filter = {};

    if (status !== "all") {
      filter.status = status;
    }

    if (paymentStatus !== "all") {
      filter.paymentStatus = paymentStatus;
    }

    // Search by order ID, buyer name, or buyer email.
    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const buyerRegex = new RegExp(escapedSearch, "i");

      const matchingUsers = await User.find({
        $or: [
          { name: buyerRegex },
          { email: buyerRegex },
        ],
      }).select("_id");

      const buyerIds = matchingUsers.map((user) => user._id);

      const searchConditions = [
        { buyerId: { $in: buyerIds } },
      ];

      if (mongoose.Types.ObjectId.isValid(search)) {
        searchConditions.push({ _id: search });
      }

      filter.$or = searchConditions;
    }

    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .select("-items.refundDetails -items.refundDetailsSubmittedAt")
        .populate("buyerId", "name email")
        .populate("items.storeId", "storeName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        limit,
      },
    });
  } catch (error) {
    console.error("Admin orders error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// Get all return requests for admin
const getAdminReturnRequests = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const search = req.query.search?.trim() || "";
    const returnStatus = req.query.returnStatus || "all";
    const refundStatus = req.query.refundStatus || "all";

    const allowedReturnStatuses = [
      "requested",
      "approved",
      "rejected",
      "completed",
    ];

    const allowedRefundStatuses = [
      "not_applicable",
      "pending",
      "processing",
      "refunded",
      "failed",
    ];

    if (
      returnStatus !== "all" &&
      !allowedReturnStatuses.includes(returnStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid return status filter",
      });
    }

    if (
      refundStatus !== "all" &&
      !allowedRefundStatuses.includes(refundStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund status filter",
      });
    }

    const pipeline = [
      // Convert each order item into a separate document
      {
        $unwind: "$items",
      },

      // Only show items for which a return was requested
      {
        $match: {
          "items.returnStatus": {
            $in: allowedReturnStatuses,
          },
        },
      },
    ];

    // Filter by return status
    if (returnStatus !== "all") {
      pipeline.push({
        $match: {
          "items.returnStatus": returnStatus,
        },
      });
    }

    // Filter by refund status
    if (refundStatus !== "all") {
      pipeline.push({
        $match: {
          "items.refundStatus": refundStatus,
        },
      });
    }

    // Get buyer details
    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "buyerId",
          foreignField: "_id",
          as: "buyer",
        },
      },
      {
        $unwind: {
          path: "$buyer",
          preserveNullAndEmptyArrays: true,
        },
      }
    );

    // Search by order ID, buyer name or email
    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const searchRegex = new RegExp(escapedSearch, "i");

      const searchConditions = [
        { "buyer.name": searchRegex },
        { "buyer.email": searchRegex },
      ];

      if (mongoose.Types.ObjectId.isValid(search)) {
        searchConditions.push({
          _id: new mongoose.Types.ObjectId(search),
        });
      }

      pipeline.push({
        $match: {
          $or: searchConditions,
        },
      });
    }

    // Return requests with pagination
    pipeline.push({
      $facet: {
        metadata: [
          {
            $count: "totalRequests",
          },
        ],
        returnRequests: [
          {
            $sort: {
              "items.returnRequestedAt": -1,
            },
          },
          {
            $skip: (page - 1) * limit,
          },
          {
            $limit: limit,
          },
          {
            $project: {
              _id: 0,
              orderId: "$_id",
              orderCreatedAt: "$createdAt",

              buyer: {
                _id: "$buyer._id",
                name: "$buyer.name",
                email: "$buyer.email",
              },

              paymentMethod: 1,

              item: {
                itemId: "$items._id",
                productId: "$items.productId",
                productName: "$items.productName",
                productImage: "$items.productImage",
                storeId: "$items.storeId",
                price: "$items.price",
                quantity: "$items.quantity",
                status: "$items.status",
                paymentStatus: "$items.paymentStatus",

                returnStatus: "$items.returnStatus",
                returnReason: "$items.returnReason",
                returnDescription: "$items.returnDescription",
                returnRequestedAt: "$items.returnRequestedAt",
                returnReceivedAt: "$items.returnReceivedAt",

                refundStatus: "$items.refundStatus",
                refundAmount: "$items.refundAmount",
                refundReference: "$items.refundReference",
                refundMethod: "$items.refundMethod",
                refundedAt: "$items.refundedAt",
              },
            },
          },
        ],
      },
    });

    const [result] = await Order.aggregate(pipeline);

    const totalRequests = result.metadata[0]?.totalRequests || 0;

    return res.status(200).json({
      success: true,
      returnRequests: result.returnRequests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRequests / limit),
        totalRequests,
        limit,
      },
    });
  } catch (error) {
    console.error("Admin return requests error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch return requests",
    });
  }
};

module.exports = {
  getAdminDashboardStats,
  getAdminUsers,
  getAdminProducts,
  updateAdminProductStatus,
deleteAdminProduct,
getAdminOrders,
getAdminReturnRequests,
};
