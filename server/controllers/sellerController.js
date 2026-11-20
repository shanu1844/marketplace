
const SellerApplication = require("../models/SellerApplication");
const User = require("../models/User");
const Store = require("../models/Store");

// Submit seller application
const submitSellerApplication = async (req, res) => {
  try {
    const { storeName, description, phone } = req.body;

    if (
      typeof storeName !== "string" ||
      typeof description !== "string" ||
      typeof phone !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedStoreName = storeName.trim();
    const normalizedDescription = description.trim();
    const normalizedPhone = phone.trim();

    if (
      normalizedStoreName.length < 2 ||
      normalizedStoreName.length > 80
    ) {
      return res.status(400).json({
        success: false,
        message: "Store name must contain 2 to 80 characters",
      });
    }

    if (
      normalizedDescription.length === 0 ||
      normalizedDescription.length > 500
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must contain 1 to 500 characters",
      });
    }

    if (!/^[0-9]{10}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit phone number",
      });
    }

    const existingApplication = await SellerApplication.findOne({
      userId: req.user.userId,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted a seller application",
      });
    }

    const application = await SellerApplication.create({
      userId: req.user.userId,
      storeName: normalizedStoreName,
      description: normalizedDescription,
      phone: normalizedPhone,
    });

    return res.status(201).json({
      success: true,
      message: "Seller application submitted successfully",
      application: {
        _id: application._id,
        storeName: application.storeName,
        description: application.description,
        status: application.status,
        createdAt: application.createdAt,
      },
    });
  } catch (error) {
    console.error("Seller application error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get logged-in user's seller application
const getMySellerApplication = async (req, res) => {
  try {
    const application = await SellerApplication.findOne({
      userId: req.user.userId,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "You have not submitted a seller application",
      });
    }

    return res.status(200).json({
      success: true,
      application: {
        _id: application._id,
        storeName: application.storeName,
        description: application.description,
        phone: application.phone,
        status: application.status,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get seller application error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all seller applications (Admin)
const getAllSellerApplications = async (req, res) => {
  try {
    const applications = await SellerApplication.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications: applications.map((application) => ({
        _id: application._id,
        applicant: application.userId
          ? {
              _id: application.userId._id,
              name: application.userId.name,
              email: application.userId.email,
            }
          : null,
        storeName: application.storeName,
        description: application.description,
        phone: application.phone,
        status: application.status,
        createdAt: application.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get seller applications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Approve / Reject seller application (Admin)

const updateSellerApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { applicationId } = req.params;

    if (
      typeof status !== "string" ||
      !["approved", "rejected"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    if (!/^[a-fA-F0-9]{24}$/.test(applicationId || "")) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await SellerApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Seller application not found",
      });
    }

    if (application.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Only pending applications can be reviewed",
      });
    }

    const user = await User.findById(application.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Applicant user not found",
      });
    }

    if (status === "approved") {
      // Check whether the seller already has a store
      let store = await Store.findOne({
        sellerId: user._id,
      });

      // Create store only if it does not exist
      if (!store) {
        store = await Store.create({
          sellerId: user._id,
          storeName: application.storeName,
          description: application.description,
        });
      }

      user.role = "seller";
      await user.save();
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      success: true,
      message: `Seller application ${status} successfully`,
      application: {
        _id: application._id,
        storeName: application.storeName,
        status: application.status,
        updatedAt: application.updatedAt,
      },
    });

  } catch (error) {
    console.error("Update seller application error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports = {
  submitSellerApplication,
  getMySellerApplication,
  getAllSellerApplications,
  updateSellerApplicationStatus,
};
