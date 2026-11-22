# MarketHub – API Documentation

## Base URL

**Local**
```text
http://localhost:5000
```

**Production**
```text
https://marketplace-l0pb.onrender.com
```

All API endpoints are prefixed with `/api`, except where the full webhook path is shown.

## Authentication

Protected endpoints require a JWT token.

Include the token in the request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## 1. Authentication APIs

Base path: `/api/auth`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/register` | Public |
| POST | `/login` | Public |
| GET | `/me` | Authenticated |

## 2. Product APIs

Base path: `/api/products`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/public` | Public |
| GET | `/categories` | Public |
| GET | `/:productId` | Public |
| GET | `/my-products` | Seller |
| POST | `/` | Seller |
| PATCH | `/:productId` | Seller |
| PATCH | `/:productId/status` | Seller |
| DELETE | `/:productId` | Seller |

Product creation supports image upload using multipart form data.

## 3. Cart APIs

Base path: `/api/cart`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/` | Authenticated |
| GET | `/` | Authenticated |
| PATCH | `/quantity` | Authenticated |
| DELETE | `/` | Authenticated |
| DELETE | `/:productId` | Authenticated |

## 4. Store APIs

Base path: `/api/stores`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/` | Seller |
| GET | `/my-store` | Seller |
| PATCH | `/my-store` | Seller |
| PATCH | `/my-store/status` | Seller |

## 5. Seller Application APIs

Base path: `/api/seller`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/apply` | Authenticated |
| GET | `/my-application` | Authenticated |
| GET | `/applications` | Admin |
| PATCH | `/applications/:applicationId/status` | Admin |

## 6. Order APIs

Base path: `/api/orders`

### Buyer and payment operations

| Method | Endpoint | Access |
|---|---|---|
| POST | `/` | Authenticated |
| POST | `/razorpay/create-order` | Authenticated |
| POST | `/razorpay/verify-payment` | Authenticated |
| POST | `/razorpay/cancel-order` | Authenticated |
| POST | `/razorpay/reconcile-payment` | Admin |
| GET | `/my-orders` | Authenticated |
| GET | `/:orderId` | Authenticated |
| PATCH | `/:orderId/items/:itemId/cancel` | Authenticated |
| PATCH | `/:orderId/items/:itemId/return` | Authenticated |

### Seller order operations

| Method | Endpoint | Access |
|---|---|---|
| GET | `/seller/my-orders` | Seller |
| GET | `/seller/return-requests` | Seller |
| PATCH | `/seller/:orderId/items/:itemId/status` | Seller |
| PATCH | `/seller/:orderId/items/:itemId/payment` | Seller |
| PATCH | `/seller/:orderId/items/:itemId/return` | Seller |
| PATCH | `/seller/:orderId/items/:itemId/return-received` | Seller |
| PATCH | `/seller/:orderId/items/:itemId/refund` | Seller |
| PATCH | `/:orderId/items/:itemId/refund-details` | Authenticated |
| POST | `/seller/:orderId/items/:itemId/razorpay-refund` | Seller |

## 7. Admin APIs

Base path: `/api/admin`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/dashboard/stats` | Admin |
| GET | `/users` | Admin |
| GET | `/products` | Admin |
| PATCH | `/products/:productId/status` | Admin |
| DELETE | `/products/:productId` | Admin |
| GET | `/orders` | Admin |
| GET | `/returns` | Admin |

## 8. Razorpay Webhook

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/webhooks/razorpay` | Handle Razorpay webhook events |

The webhook route uses raw JSON request-body handling for signature verification.

## 9. Health Check

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend availability |

Production health check:

```text
https://marketplace-l0pb.onrender.com/api/health
```

## Access Control

- **Public:** No authentication required.
- **Authenticated:** Valid JWT token required.
- **Seller:** Authentication and seller role required.
- **Admin:** Authentication and admin role required.

## Notes

- All protected endpoints require the appropriate authorization.
- Product image upload uses multipart form data.
- Request bodies and response formats depend on the individual endpoint implementation.
- Never expose JWT secrets, payment credentials or database credentials in API documentation.