
const Store = require("../models/Store");

const createStore = async (req, res) => {
  try {
    const { storeName, description } = req.body;

    if (
      typeof storeName !== "string" ||
      typeof description !== "string" ||
      !storeName.trim() ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Store name and description are required",
      });
    }

    const existingStore = await Store.findOne({
      sellerId: req.user.userId,
    });

    if (existingStore) {
      return res.status(409).json({
        success: false,
        message: "You have already created a store",
      });
    }

    const store = await Store.create({
      sellerId: req.user.userId,
      storeName: storeName.trim(),
      description: description.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Store created successfully",
      store,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already created a store",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create store error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({
      sellerId: req.user.userId,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "You have not created a store yet",
      });
    }

    return res.status(200).json({
      success: true,
      store,
    });
  } catch (error) {
    console.error("Get my store error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const updateMyStore = async (req, res) => {
  try {
    const { storeName, description } = req.body;

    if (storeName === undefined && description === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide storeName or description to update",
      });
    }

    if (
      storeName !== undefined &&
      (typeof storeName !== "string" || !storeName.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Store name must be a non-empty string",
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

    if (storeName !== undefined && (storeName.trim().length < 2 || storeName.trim().length > 80)) {
  return res.status(400).json({
    success: false,
    message: "Store name must be between 2 and 80 characters",
  });
}

if (description !== undefined && description.trim().length > 500) {
  return res.status(400).json({
    success: false,
    message: "Description cannot exceed 500 characters",
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

    if (storeName !== undefined) {
      store.storeName = storeName.trim();
    }

    if (description !== undefined) {
      store.description = description.trim();
    }

    await store.save();

    return res.status(200).json({
      success: true,
      message: "Store updated successfully",
      store,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update store error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const updateStoreStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if ( typeof status !== "string" ||
  !["active", "inactive"].includes(status)) {
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

    store.status = status;
    await store.save();

    return res.status(200).json({
      success: true,
      message: `Store ${status} successfully`,
      store: {
        id: store._id,
        storeName: store.storeName,
        status: store.status,
      },
    });
  } catch (error) {
    console.error("Update store status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports = { createStore, getMyStore,updateMyStore, updateStoreStatus,};
