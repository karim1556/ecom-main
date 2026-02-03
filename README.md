# DiscoverProjects.com - Student eCommerce Platform

A modern, full-stack eCommerce application built for selling STEM/tech products (robotics kits, Arduino, IoT components, 3D printers) to students and educators. Features a responsive storefront, user dashboard, comprehensive admin panel, and Supabase backend.

## Features

### Student Storefront
- **Landing Page**: Hero section, featured products, categories, why choose us, testimonials, and newsletter
- **Product Catalog**: Browse products with search, category filters, price range, and grid/list view toggle
- **Product Details**: View specifications, ratings, quantity selector, add to cart/wishlist, and view included learning content
- **SKU Support**: Stock Keeping Unit numbers for inventory management and product identification
- **Product Information**: Detailed specs, warranty, and other product information
- **Shopping Cart**: Real-time cart management with quantity updates and **optimized performance**
- **Wishlist**: Save favorite products for later purchase (auth-protected)
- **Checkout**: Secure checkout with order summary, shipping & tax calculation, **discount coupon support**, and **complete address collection**
- **Currency Support**: Toggle between INR and USD with real-time exchange rate conversion
- **AI Chat Assistant**: Floating chat widget powered by Groq API for instant customer support
- **Responsive Design**: Mobile-first design with hamburger menu
- **Social Sharing**: Share product links via Facebook, Twitter, WhatsApp, or copy link

### User Dashboard
- **Dashboard Overview**: Total orders, total spent, pending orders stats
- **Order History**: View all past orders with status tracking
- **Order Details**: Detailed view of each order
- **Profile Settings**: Update personal information and preferences

### Admin Dashboard
- **Dashboard Stats**: Revenue, total orders, products count, and customer metrics
- **Product Management**: Full CRUD - create, edit, delete products with **image upload to Supabase Storage**
- **Order Management**: **Enhanced order display with complete pricing breakdown**, view order details, update status (processing/completed/cancelled), **user address access**
- **Customer Management**: View all customers, order history, total spent per customer
- **Coupon Management**: Create, edit, delete discount coupons; configure percentage/fixed discounts, min order amount, max discount, usage limits, active state, and expiry
- **Analytics**: Revenue by category, orders by status, time range filtering
- **Settings**: Store info, notifications, security, and appearance settings

### Enhanced Order Management
- **Complete Pricing Display**: Shows subtotal, shipping, tax (10%), discounts, and final total
- **Order Details Modal**: Comprehensive view including product information, pricing breakdown, and customer details
- **User Address Access**: One-click access to complete customer shipping and contact information
- **Clean Table Layout**: Removed technical ID columns for better user experience
- **Accurate Revenue Tracking**: Orders reflect actual amounts paid including taxes and shipping
- **Stock Integration**: Automatic stock reduction on order completion

### SKU & Inventory Management
- **Stock Keeping Unit (SKU)**: Unique product identifiers for inventory tracking
- **Real-time Validation**: Prevent duplicate SKUs during product creation and editing
- **Professional Display**: SKU numbers shown on product listings and detail pages
- **Database Integrity**: UNIQUE constraints and indexed for optimal performance
- **Smart Editing**: Exclude current product SKU when editing existing products
- **Stock Tracking**: Complete inventory management with quantity tracking
- **Low Stock Alerts**: Configurable thresholds for low stock notifications
- **Real-time Stock Updates**: **Automatic stock reduction on checkout with proper error handling**
- **Overselling Prevention**: Cart validation prevents adding more items than available
- **Stock Status Display**: Visual indicators showing exact stock levels and availability
- **Optimized Performance**: **Parallel database queries and optimistic updates for faster cart operations**

### Discount & Pricing System
- **Product-Level Discounts**: Support for percentage discounts on individual products
- **Coupon System**: Advanced coupon management with percentage/fixed discounts
- **Discounted Pricing Display**: Shows original and discounted prices with visual indicators
- **Cart & Checkout Integration**: Discounts properly calculated throughout the purchase flow
- **Accurate Tax Calculation**: Taxes calculated on discounted prices, not original prices

### Learning Content Integration
- **Courses Linked to Products**: Each product can have one or more associated courses
- **Included Courses Section**: Product detail page highlights the courses unlocked with a purchase
- **Course Management**: Full CRUD - create, edit, delete courses with **thumbnail upload to Supabase Storage**
- **Module & Lesson Structure**: Organize courses into modules with individual lessons
- **Rich Content**: Support for video URLs and markdown content in lessons
- **Automatic Course Access**: **Grant course access immediately after successful purchase**

### Additional Pages
- **Blog**: Articles with categories and featured posts
- **About**: Company story, team, values, and stats
- **Support**: FAQs, help categories, and contact options
- **Contact**: Contact form with location info
- **404 Page**: Custom not found page with helpful links

### Authentication & Security
- Email/password signup and login via Supabase Auth
- **Google OAuth**: Sign in with Google account option
- Role-based access (user/admin)
- Protected routes for dashboard and admin
- Row Level Security (RLS) on all tables

### Image Upload & Storage
- **Supabase Storage Integration**: Product images and course thumbnails are uploaded and stored in dedicated Supabase Storage buckets
- **File Upload Interface**: Drag-and-drop or click-to-upload image selection with preview
- **Image Management**: Replace existing product images or upload new ones during creation/editing
- **Course Thumbnails**: Upload and manage course thumbnail images with the same workflow as products
- **Automatic URL Generation**: Public URLs are automatically generated for stored images
- **Supported Formats**: JPG, PNG, GIF, WebP image formats
- **Unique File Naming**: Timestamp-based naming prevents conflicts
- **Separate Buckets**: `product-images` and `course-thumbnails` buckets for organized storage

### Branding & Design
- **Professional Logo**: Custom logo implementation across all platform components
- **Consistent Branding**: Logo displayed in navigation, sidebars, and footer
- **Responsive Design**: Logo scales appropriately across all device sizes
- **Modern UI/UX**: Clean, professional design with shadcn/ui components
- **Mobile-First Approach**: Optimized for mobile devices with responsive layouts
- **Hydration Safety**: **Fixed React hydration issues for consistent server/client rendering**

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (product images, course thumbnails)
- **Authentication**: Supabase Auth with Google OAuth
- **State Management**: React Context (Cart, Wishlist, Currency)
- **AI Integration**: Groq SDK for AI chat assistant
- **External APIs**: Real-time exchange rate API for currency conversion

## Project Structure

\`\`\`
app/
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout
├── globals.css                 # Design tokens & styles
├── not-found.tsx               # 404 page
├── auth/page.tsx               # Login/signup
├── shop/
│   ├── page.tsx               # Product listing
│   └── [id]/page.tsx          # Product detail
├── cart/page.tsx               # Shopping cart
├── checkout/page.tsx           # Checkout (enhanced with address collection)
├── wishlist/page.tsx           # Wishlist
├── dashboard/
│   ├── layout.tsx             # User dashboard layout
│   ├── page.tsx               # User dashboard home
│   ├── orders/page.tsx        # Order history
│   └── settings/page.tsx      # User settings
├── admin/
│   ├── layout.tsx             # Admin layout with sidebar
│   ├── page.tsx               # Admin dashboard
│   ├── products/
│   │   ├── page.tsx           # Product list
│   │   ├── new/page.tsx       # Create product
│   │   └── [id]/page.tsx      # Edit product
│   ├── orders/page.tsx        # Order management (enhanced with pricing details)
│   ├── customers/page.tsx     # Customer list
│   ├── analytics/page.tsx     # Analytics & reports
│   ├── coupons/
│   │   ├── page.tsx           # Coupon list & management
│   │   ├── new/page.tsx       # Create coupon
│   │   └── [id]/edit/page.tsx # Edit coupon
│   └── settings/page.tsx      # Admin settings
├── blog/page.tsx               # Blog articles
├── about/page.tsx              # About us
├── support/page.tsx            # Support & FAQs
├── contact/page.tsx            # Contact form
└── api/
    ├── products/              # Products CRUD
    │   ├── stock/             # Stock management API
    │   └── check-sku          # SKU validation
    ├── orders/                # Orders API
    ├── cart/                  # Cart API
    ├── coupons/               # Coupons CRUD & validation
    ├── checkout/              # Checkout processing (enhanced with address saving)
    ├── chat/                  # AI chat API endpoint
    └── exchange-rate/         # Currency exchange rate API

components/
├── navbar.tsx                 # Responsive navigation with currency switcher
├── hero.tsx                   # Hero section
├── featured-products.tsx      # Product grid with currency display
├── categories.tsx             # Category cards
├── why-shop.tsx              # Features section
├── use-cases.tsx             # Use case showcase
├── testimonials.tsx          # Customer reviews
├── newsletter.tsx            # Newsletter signup
├── footer.tsx                # Footer
├── ChatWidget.tsx            # AI chat widget
├── ChatButton.tsx            # Floating chat button
├── admin/
│   ├── admin-sidebar.tsx     # Admin navigation
│   ├── admin-header.tsx      # Admin header (hydration-safe)
│   └── stats-card.tsx        # Stats display card
└── user/
    └── user-sidebar.tsx      # User dashboard nav

lib/
├── cart-context.tsx          # Cart state management (optimized performance)
├── wishlist-context.tsx      # Wishlist state management
├── currency-context.tsx      # Currency conversion & switching
├── groq.ts                   # Groq AI integration
├── supabase/
│   ├── client.ts             # Browser client
│   └── server.ts             # Server client
└── utils.ts                  # Utility functions

scripts/
├── 01-init-schema.sql        # Products & orders tables
├── 02-auth-schema.sql        # Profiles & roles (enhanced with address fields)
├── 03-cart-schema.sql        # Cart items table
├── 04-wishlist-schema.sql    # Wishlist table
├── 05-categories-schema.sql  # Product categories
├── 05-courses-schema.sql     # Courses & lessons
├── 06-courses-rls.sql        # Course RLS policies
├── 07-coupon.sql              # Coupons table
├── 08-add-sku-to-products.sql # SKU field for products
├── 10-add-stock-tracking.sql  # Stock tracking fields
└── 11-update-orders-structure.sql # Enhanced order structure (ready for migration)
\`\`\`

## Routes

### Public Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/shop` | Product catalog |
| `/shop/[id]` | Product details |
| `/cart` | Shopping cart |
| `/dashboard/wishlist` | Saved products |
| `/auth` | Login/signup |
| `/blog` | Blog articles |
| `/about` | About us |
| `/support` | Help & FAQs |
| `/contact` | Contact form |

### User Routes (Authentication Required)
| Route | Description |
|-------|-------------|
| `/checkout` | Checkout page |
| `/dashboard` | User dashboard |
| `/dashboard/orders` | Order history |
| `/dashboard/settings` | Profile settings |

### Admin Routes (Admin Role Required)
| Route | Description |
|-------|-------------|
| `/admin` | Admin dashboard |
| `/admin/products` | Product management |
| `/admin/products/new` | Create product |
| `/admin/products/[id]` | Edit product |
| `/admin/orders` | Order management |
| `/admin/customers` | Customer list |
| `/admin/analytics` | Analytics & reports |
| `/admin/coupons` | Coupon management (list) |
| `/admin/coupons/new` | Create coupon |
| `/admin/coupons/[id]/edit` | Edit coupon |
| `/admin/settings` | Admin settings |

## API Endpoints

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product (admin)
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)
- `POST /api/products/check-sku` - Validate SKU uniqueness
- `GET /api/products/stock` - Get stock information
- `POST /api/products/stock` - Update stock levels

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PUT /api/orders/[id]` - Update status

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add/update cart
- `DELETE /api/cart` - Remove item

### Checkout
- `POST /api/checkout` - Process checkout

### Coupons
- `GET /api/coupons` - List coupons (admin)
- `POST /api/coupons` - Create coupon (admin)
- `GET /api/coupons/[id]` - Get coupon details (admin)
- `PUT /api/coupons/[id]` - Update coupon (admin)
- `DELETE /api/coupons/[id]` - Delete coupon (admin)
- `POST /api/coupons/validate` - Validate coupon code and calculate discount for a given cart total

### AI Chat
- `POST /api/chat` - Send message to AI assistant and get response

### Exchange Rates
- `GET /api/exchange-rate` - Get current INR to USD exchange rate

## Database Schema

### Products
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | text | Product name |
| description | text | Description |
| specification | text | Technical specifications |
| warranty | text | Warranty information |
| other_info | text | Additional product details |
| price | decimal | Price |
| discount_percent | decimal | Discount percentage |
| category | text | Category |
| thumbnail_url | text | Image URL |
| sku | varchar(100) | Stock Keeping Unit (unique) |
| stock_quantity | integer | Current stock quantity |
| low_stock_threshold | integer | Low stock alert threshold |
| track_stock | boolean | Whether to track inventory |
| created_at | timestamp | Created date |
| updated_at | timestamp | Last updated |

### Orders
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Customer ID |
| product_id | UUID | Product ID |
| quantity | integer | Quantity |
| amount | decimal | Total amount |
| status | text | pending/processing/completed/cancelled |
| created_at | timestamp | Order date |

### Profiles
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auth.users) |
| email | text | User email |
| full_name | text | Display name |
| phone | text | Phone number (optional) |
| address | text | Street address (optional) |
| city | text | City (optional) |
| state | text | State/region (optional) |
| postal_code | text | ZIP/postal code (optional) |
| country | text | Country (optional) |
| role | text | user/admin |
| created_at | timestamp | Registration date |
| updated_at | timestamp | Last updated |

### Cart Items
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User ID |
| product_id | UUID | Product ID |
| quantity | integer | Quantity |

### Wishlist Items
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User ID |
| product_id | UUID | Product ID |
| created_at | timestamp | Added date |

### Coupons
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| code | text | Unique coupon code (e.g. SAVE10) |
| description | text | Optional description shown in admin |
| discount_type | text | `percentage` or `fixed` |
| discount_value | decimal | Percentage (e.g. 10) or fixed amount (e.g. 500) |
| min_order_amount | decimal | Optional minimum order total required to apply |
| max_discount_amount | decimal | Optional max discount cap (for percentage coupons) |
| usage_limit | integer | Optional total number of uses allowed |
| used_count | integer | Number of times coupon has been used |
| is_active | boolean | Whether coupon is currently active |
| expires_at | timestamp | Expiry date/time |
| created_at | timestamp | Created date |
| updated_at | timestamp | Last updated date |

### Courses
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | text | Course title |
| description | text | Course overview |
| level | text | Difficulty level (beginner/intermediate/advanced) |
| thumbnail_url | text | Optional course thumbnail image |
| created_at | timestamp | Created date |

### Product Courses (Join Table)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_id | UUID | Linked product ID |
| course_id | UUID | Linked course ID |
| created_at | timestamp | Linked date |

## Recent Enhancements

### 🚀 Performance Optimizations
- **Cart Operations**: Optimized `addToCart` with parallel database queries and optimistic updates
- **Faster Checkout**: Reduced database calls and improved response times
- **Hydration Safety**: Fixed React hydration mismatches for consistent rendering

### 💰 Enhanced Pricing System
- **Complete Order Pricing**: Orders now include subtotal, shipping, tax (10%), discounts, and final total
- **Discount Display**: Shows original and discounted prices with visual indicators throughout the platform
- **Accurate Revenue**: Order amounts reflect actual money received including all fees
- **Tax Calculation**: Taxes properly calculated on discounted prices

### 📦 Improved Inventory Management
- **Automatic Stock Reduction**: Stock automatically reduced on successful checkout
- **Error Handling**: Graceful handling of stock API failures
- **Course Access**: Automatic course enrollment after purchase
- **Address Collection**: Complete customer address information saved during checkout

### 🎯 Enhanced Admin Experience
- **Cleaner Order Table**: Removed technical ID columns for better UX
- **User Address Access**: One-click access to complete customer shipping details
- **Order Details Modal**: Comprehensive pricing breakdown and order information
- **Better Search**: Enhanced search functionality across order data

### 🏪 Checkout Improvements
- **Address Persistence**: Customer addresses saved to profiles for future use
- **Complete Data Flow**: From checkout form to admin dashboard
- **Error Resilience**: Checkout continues even if optional features fail

## Environment Variables

Automatically configured via Supabase integration:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
POSTGRES_URL
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
GROQ_API_KEY                    # Required for AI chat functionality
```

## Getting Started

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd ecom
   npm install
   ```

2. **Initialize Database**
   Run SQL scripts in order:
   - `scripts/01-init-schema.sql`
   - `scripts/02-auth-schema.sql` (enhanced with address fields)
   - `scripts/03-cart-schema.sql`
   - `scripts/04-wishlist-schema.sql`
   - `scripts/05-categories-schema.sql`
   - `scripts/05-courses-schema.sql`
   - `scripts/06-courses-rls.sql`
   - `scripts/07-coupon.sql`
   - `scripts/08-add-sku-to-products.sql`
   - `scripts/10-add-stock-tracking.sql`
   - `scripts/11-update-orders-structure.sql` (optional - for enhanced order features)

3. **Start Development**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Create Admin User**
   - Sign up normally
   - Update profile role to 'admin' in Supabase dashboard

5. **Configure Features**
   - Set up GROQ_API_KEY for AI chat functionality
   - Configure stock tracking for products
   - Create discount coupons in admin panel

## Design System

### Colors
- **Primary**: Green (#2D5016) - Brand, headers
- **Accent**: Orange (#FF6B35) - CTAs, highlights
- **Background**: White (#FFFFFF)
- **Foreground**: Dark (#1a1a1a)

### Typography
- Font: System sans-serif (Geist)
- Headings: Bold, balanced line breaks
- Body: Regular, relaxed line height

### Components
Built with shadcn/ui: Button, Card, Badge, Input, Select, Sheet, Tabs, Table, Dropdown, Avatar, Skeleton, and more.

## License

MIT License - For educational purposes.
