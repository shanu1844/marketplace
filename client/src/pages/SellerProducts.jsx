
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  Plus,
  RefreshCw,
  ArrowUpRight,
  Search,
  X,
  Trash2,
  Image as ImageIcon,
  IndianRupee,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Upload,
  Layers3,
} from "lucide-react";
import api from "../services/api";

const initialFormData = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
};

const inputClass =
  "w-full rounded-xl border border-[#e7e7df] bg-[#fbfbf8] px-4 py-3 text-sm text-[#252923] outline-none transition placeholder:text-[#a0a398] focus:border-[#174b38] focus:bg-white focus:ring-4 focus:ring-[#174b38]/[0.07]";

const labelClass = "mb-2 block text-sm font-semibold text-[#42483f]";

function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const imageInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  const loadProducts = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/products/my-products");
      const data = response.data;

      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
          ? data.products
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setProducts(productList);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load your products."
      );
    } finally {
      setLoading(false);
    }
  }, []);

 useEffect(() => {
  let active = true;

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products/my-products");
      const data = response.data;

      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
          ? data.products
          : Array.isArray(data?.data)
            ? data.data
            : [];

      if (active) {
        setProducts(productList);
        setError("");
      }
    } catch (requestError) {
      if (active) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load your products."
        );
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  };

  fetchProducts();

  return () => {
    active = false;
  };
}, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file.");
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormError("");
  };

  const resetForm = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setFormData(initialFormData);
    setImageFile(null);
    setImagePreview("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();

    setFormError("");
    setFormSuccess("");

    const price = Number(formData.price);
    const stock = Number(formData.stock);

    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Price must be greater than zero.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setFormError("Stock must be a non-negative integer.");
      return;
    }

    if (!imageFile) {
      setFormError("Please select a product image.");
      return;
    }

    try {
      setSaving(true);

      const productData = new FormData();

      productData.append("name", formData.name.trim());
      productData.append("description", formData.description.trim());
      productData.append("price", String(price));
      productData.append("stock", String(stock));
      productData.append("category", formData.category.trim());
      productData.append("image", imageFile);

      const response = await api.post("/products", productData);

      resetForm();

      setFormSuccess(
        response.data?.message || "Product created successfully."
      );

      await loadProducts();
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.message ||
          "Unable to create product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(productId);
      setError("");

      await api.delete(`/products/${productId}`);
      await loadProducts();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete product. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getProductImage = (product) => {
    const firstImage = product.images?.[0];

    return (
      product.image ||
      product.imageUrl ||
      (typeof firstImage === "string" ? firstImage : firstImage?.url) ||
      ""
    );
  };

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  const stats = useMemo(() => {
    const totalProducts = products.length;

    const totalStock = products.reduce(
      (total, product) => total + Math.max(0, Number(product.stock) || 0),
      0
    );

    const lowStock = products.filter((product) => {
      const stock = Number(product.stock);
      return Number.isFinite(stock) && stock > 0 && stock <= 5;
    }).length;

    const outOfStock = products.filter(
      (product) => Number(product.stock) === 0
    ).length;

    return {
      totalProducts,
      totalStock,
      lowStock,
      outOfStock,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const name = (product.name || product.title || "").toLowerCase();
      const category = (product.category || "").toLowerCase();
      const query = search.trim().toLowerCase();
      const stock = Number(product.stock);

      const matchesSearch =
        !query || name.includes(query) || category.includes(query);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "available" && stock > 5) ||
        (stockFilter === "low" && stock > 0 && stock <= 5) ||
        (stockFilter === "out" && stock === 0);

      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter]);

  const statCards = [
    {
      label: "Total products",
      value: stats.totalProducts,
      icon: Package,
      detail: "Products in your store",
      iconBg: "bg-[#e9eee6]",
      iconColor: "text-[#174b38]",
    },
    {
      label: "Available stock",
      value: stats.totalStock.toLocaleString("en-IN"),
      icon: Boxes,
      detail: "Units across products",
      iconBg: "bg-[#edf0e8]",
      iconColor: "text-[#637a4e]",
    },
    {
      label: "Low stock",
      value: stats.lowStock,
      icon: AlertTriangle,
      detail: "5 or fewer units",
      iconBg: "bg-[#f8efe0]",
      iconColor: "text-[#a36d27]",
    },
    {
      label: "Out of stock",
      value: stats.outOfStock,
      icon: Layers3,
      detail: "Products unavailable",
      iconBg: "bg-[#f8e9e6]",
      iconColor: "text-[#b65c4c]",
    },
  ];

  const getStockDetails = (stockValue) => {
    const stock = Number(stockValue);

    if (!Number.isFinite(stock) || stock < 0) {
      return {
        label: "Unknown",
        className: "bg-[#f0f0eb] text-[#73786f]",
        dot: "bg-[#92968d]",
      };
    }

    if (stock === 0) {
      return {
        label: "Out of stock",
        className: "bg-[#fbece9] text-[#b65c4c]",
        dot: "bg-[#b65c4c]",
      };
    }

    if (stock <= 5) {
      return {
        label: "Low stock",
        className: "bg-[#fbf2e4] text-[#a36d27]",
        dot: "bg-[#c18b3e]",
      };
    }

    return {
      label: "In stock",
      className: "bg-[#eaf1e9] text-[#174b38]",
      dot: "bg-[#43815e]",
    };
  };

  return (
    <main className="min-h-screen bg-[#f7f6f0] px-4 py-7 text-[#252923] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#dce5d9] bg-[#eaf0e7] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#174b38]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#43815e]" />
              Seller workspace
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#252923] sm:text-4xl">
              Product inventory
              <span className="text-[#174b38]">.</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#777b72]">
              Manage your catalogue, monitor stock levels and keep your store
              up to date.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e4e4dc] bg-white px-4 py-3 text-sm font-semibold text-[#42483f] transition hover:bg-[#f0f1eb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAddForm((previous) => !previous);
                setFormError("");
                setFormSuccess("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174b38] px-5 py-3 text-sm font-semibold text-white! shadow-[0_5px_15px_rgba(23,75,56,0.15)] transition hover:-translate-y-0.5 hover:bg-[#103729] hover:shadow-lg"
            >
              {showAddForm ? <X size={17} /> : <Plus size={17} />}
              {showAddForm ? "Close form" : "Add product"}
            </button>
          </div>
        </motion.section>

        {/* Stats */}
        <section className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.article
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="rounded-2xl border border-[#e8e7df] bg-white p-4 shadow-[0_5px_20px_rgba(37,41,35,0.025)] sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-[#777b72] sm:text-sm">
                      {stat.label}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#252923] sm:text-3xl">
                      {stat.value}
                    </h2>
                  </div>

                  <div className={`rounded-xl p-2.5 ${stat.iconBg}`}>
                    <Icon size={19} className={stat.iconColor} />
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-[#92968d] sm:text-xs">
                  {stat.detail}
                </p>
              </motion.article>
            );
          })}
        </section>

        {/* Add Product Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.section
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              className="mb-7 overflow-hidden"
            >
              <div className="rounded-2xl border border-[#e4e7dc] bg-white shadow-[0_10px_35px_rgba(37,41,35,0.045)]">
                <div className="flex flex-col justify-between gap-3 border-b border-[#efefe9] px-5 py-5 sm:flex-row sm:items-center sm:px-7">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#6f8a70]">
                      New listing
                    </span>
                    <h2 className="mt-1 text-xl font-bold text-[#252923]">
                      Add a product
                    </h2>
                    <p className="mt-1 text-sm text-[#85897f]">
                      Enter the details to list a new item in your store.
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf0e7] text-[#174b38]">
                    <Package size={21} />
                  </div>
                </div>

                <form
                  onSubmit={handleAddProduct}
                  className="grid grid-cols-1 gap-7 p-5 sm:p-7 lg:grid-cols-[1fr_280px]"
                >
                  <div className="space-y-5">
                    {formError && (
                      <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                      >
                        {formError}
                      </div>
                    )}

                    {formSuccess && (
                      <div
                        role="status"
                        className="flex items-center gap-2 rounded-xl border border-[#d6e5d4] bg-[#edf4eb] px-4 py-3 text-sm text-[#174b38]"
                      >
                        <CheckCircle2 size={17} />
                        {formSuccess}
                      </div>
                    )}

                    <div>
                      <label htmlFor="product-name" className={labelClass}>
                        Product name
                      </label>
                      <input
                        id="product-name"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                        maxLength={120}
                        className={inputClass}
                        placeholder="e.g. Cotton casual shirt"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="product-description"
                        className={labelClass}
                      >
                        Product description
                      </label>
                      <textarea
                        id="product-description"
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleFormChange}
                        required
                        className={`${inputClass} resize-y`}
                        placeholder="Describe your product, its features and details..."
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="product-price" className={labelClass}>
                          Price (₹)
                        </label>
                        <div className="relative">
                          <IndianRupee
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a8e84]"
                          />
                          <input
                            id="product-price"
                            name="price"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={formData.price}
                            onChange={handleFormChange}
                            required
                            className={`${inputClass} pl-10`}
                            placeholder="699"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="product-stock" className={labelClass}>
                          Available stock
                        </label>
                        <input
                          id="product-stock"
                          name="stock"
                          type="number"
                          min="0"
                          step="1"
                          value={formData.stock}
                          onChange={handleFormChange}
                          required
                          className={inputClass}
                          placeholder="20"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="product-category"
                        className={labelClass}
                      >
                        Category
                      </label>
                      <input
                        id="product-category"
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        required
                        className={inputClass}
                        placeholder="e.g. Clothing"
                      />
                    </div>

                    <div className="flex flex-col gap-3 border-t border-[#efefe9] pt-5 sm:flex-row sm:items-center">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174b38] px-6 py-3 text-sm font-semibold text-white! transition hover:bg-[#103729] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Plus size={17} />
                        )}
                        {saving ? "Saving product..." : "Save product"}
                      </button>

                      <button
                        type="button"
                        onClick={resetForm}
                        disabled={saving}
                        className="rounded-xl border border-[#e6e6df] px-5 py-3 text-sm font-semibold text-[#62675e] transition hover:bg-[#f7f7f2] disabled:opacity-50"
                      >
                        Clear fields
                      </button>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className={labelClass}>Product image</label>

                    <label
                      htmlFor="product-image"
                      className="group flex min-h-60 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#dce3d8] bg-[#f8f9f5] p-4 text-center transition hover:border-[#174b38] hover:bg-[#f1f5ee]"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Selected product preview"
                          className="h-52 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <>
                          <div className="mb-4 rounded-2xl bg-[#e7eee4] p-4 text-[#174b38] transition group-hover:scale-105">
                            <Upload size={25} />
                          </div>
                          <p className="text-sm font-semibold text-[#42483f]">
                            Upload product image
                          </p>
                          <p className="mt-2 text-xs leading-5 text-[#92968d]">
                            PNG, JPG or WEBP
                            <br />
                            Select an image from your device
                          </p>
                        </>
                      )}

                      <input
                        ref={imageInputRef}
                        id="product-image"
                        name="image"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageChange}
                        required
                        className="sr-only"
                      />
                    </label>

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                        }}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        <X size={14} />
                        Remove selected image
                      </button>
                    )}

                    <p className="mt-3 text-xs leading-5 text-[#92968d]">
                      Use a clear, high-quality image to make your product
                      stand out.
                    </p>
                  </div>
                </form>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Inventory Toolbar */}
        <section className="mb-5 rounded-2xl border border-[#e8e7df] bg-white p-4 shadow-[0_5px_20px_rgba(37,41,35,0.025)] sm:p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#252923]">
                  Your catalogue
                </h2>
                <span className="rounded-full bg-[#edf1e9] px-2.5 py-1 text-xs font-semibold text-[#174b38]">
                  {filteredProducts.length}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#85897f]">
                Search and manage your listed products.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-64">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#92968d]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="w-full rounded-xl border border-[#e8e7df] bg-[#fafaf7] py-2.5 pl-10 pr-10 text-sm outline-none transition placeholder:text-[#a0a398] focus:border-[#174b38] focus:bg-white focus:ring-4 focus:ring-[#174b38]/6"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#92968d] hover:text-[#252923]"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <select
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value)}
                aria-label="Filter products by stock"
                className="rounded-xl border border-[#e8e7df] bg-[#fafaf7] px-3.5 py-2.5 text-sm font-medium text-[#555b51] outline-none transition focus:border-[#174b38]"
              >
                <option value="all">All products</option>
                <option value="available">In stock</option>
                <option value="low">Low stock</option>
                <option value="out">Out of stock</option>
              </select>
            </div>
          </div>
        </section>

        {/* API Error */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={handleRefresh}
              className="font-semibold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-70 flex-col items-center justify-center rounded-2xl border border-[#e8e7df] bg-white">
            <RefreshCw size={26} className="animate-spin text-[#174b38]" />
            <p className="mt-4 text-sm font-medium text-[#73786f]">
              Loading your inventory...
            </p>
          </div>
        ) : products.length === 0 && !error ? (
          /* Empty Inventory */
          <section className="flex min-h-87.5 flex-col items-center justify-center rounded-2xl border border-dashed border-[#d9ded4] bg-white px-5 py-14 text-center">
            <div className="mb-5 rounded-2xl bg-[#eaf0e7] p-5 text-[#174b38]">
              <Package size={34} />
            </div>

            <h2 className="text-xl font-bold text-[#252923]">
              Your store is waiting for its first product
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-[#85897f]">
              Add your first product to start building your catalogue and
              showcase your collection.
            </p>

            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#174b38] px-5 py-3 text-sm font-semibold text-white! transition hover:bg-[#103729]"
            >
              <Plus size={17} />
              Add your first product
            </button>
          </section>
        ) : filteredProducts.length === 0 ? (
          /* No Search Results */
          <section className="flex min-h-65 flex-col items-center justify-center rounded-2xl border border-dashed border-[#d9ded4] bg-white px-5 py-12 text-center">
            <div className="mb-4 rounded-2xl bg-[#f0f1eb] p-4 text-[#73786f]">
              <Search size={27} />
            </div>

            <h2 className="text-lg font-bold text-[#252923]">
              No matching products
            </h2>

            <p className="mt-2 text-sm text-[#85897f]">
              Try another search or change your stock filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStockFilter("all");
              }}
              className="mt-4 text-sm font-semibold text-[#174b38] hover:underline"
            >
              Clear filters
            </button>
          </section>
        ) : (
          /* Product Grid */
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => {
              const imageUrl = getProductImage(product);
              const stock = Number(product.stock);
              const stockDetails = getStockDetails(product.stock);
              const productId = product._id;

              return (
                <motion.article
                  key={productId || `${product.name}-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.2) }}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e8e7df] bg-white shadow-[0_5px_20px_rgba(37,41,35,0.025)] transition duration-300 hover:-translate-y-1 hover:border-[#d4dfd1] hover:shadow-[0_14px_35px_rgba(37,41,35,0.08)]"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-[#f0f0e9]">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name || product.title || "Product"}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-[#a1a397]">
                        <ImageIcon size={34} strokeWidth={1.4} />
                        <span className="text-xs">No product image</span>
                      </div>
                    )}

                    <div className="absolute left-3 top-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm ${stockDetails.className}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${stockDetails.dot}`}
                        />
                        {stockDetails.label}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-[#174b38] shadow-sm backdrop-blur">
                      {formatPrice(product.price)}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="max-w-[70%] truncate rounded-md bg-[#edf1e9] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#53704e]">
                        {product.category || "Uncategorized"}
                      </span>

                      <span className="text-[11px] text-[#92968d]">
                        {product.status || "Active"}
                      </span>
                    </div>

                    <h3 className="mt-3 line-clamp-2 min-h-12 text-base font-bold leading-6 text-[#252923]">
                      {product.name || product.title || "Untitled product"}
                    </h3>

                    <div className="mt-4 flex items-center justify-between border-t border-[#efefe9] pt-3">
                      <div>
                        <p className="text-[11px] text-[#92968d]">
                          Available quantity
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#42483f]">
                          {Number.isFinite(stock) ? stock : "N/A"}{" "}
                          <span className="text-xs font-normal text-[#92968d]">
                            units
                          </span>
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f2f3ed] text-[#65745d]">
                        <Boxes size={17} />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-[1fr_auto] gap-2 border-t border-[#efefe9] p-3">
                    <Link
                      to={`/products/${productId}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174b38] px-3 py-2.5 text-xs font-semibold text-white! transition hover:bg-[#103729]"
                    >
                      <Eye size={15} />
                      View product
                      <ArrowUpRight size={14} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(productId)}
                      disabled={!productId || deletingId === productId}
                      aria-label="Delete product"
                      title="Delete product"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#f0deda] bg-[#fff8f6] text-[#b65c4c] transition hover:border-red-300 hover:bg-[#fbece9] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === productId ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </section>
        )}

        {/* Footer */}
        {!loading && products.length > 0 && (
          <div className="mt-6 flex flex-col justify-between gap-2 border-t border-[#e5e5dc] py-5 text-xs text-[#85897f] sm:flex-row sm:items-center">
            <p>
              Showing {filteredProducts.length} of {products.length} products
            </p>
            <p className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#648365]" />
              Inventory overview
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default SellerProducts;
