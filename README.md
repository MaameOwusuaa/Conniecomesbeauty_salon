# Conniecomes Beauty Salon — HTML/CSS/JavaScript Frontend

This is an e-commerce and salon-booking website built with plain HTML5, CSS3, vanilla JavaScript, and a FastAPI backend.

## Run
Open `index.html` directly in a browser, or serve the folder with a simple local server.

## Included
- Responsive luxury salon storefront
- Shop and category navigation
- Frontals: 13x4, 13x6, glueless
- Closures: 2x6, 4x4, 5x5, 6x6
- Straight and curly hair
- Custom made wig caps
- Product detail pages
- Product color/length variants with variant-specific images and inventory
- Cart with localStorage persistence
- Checkout
- Card and Mobile Money payment UI
- Appointment booking
- Administrator dashboard for catalog, services, contact messages, bookings and product sales
- Services, About, Contact and Account pages
- Image placeholders instead of real images

## Backend integration
The database is the source of truth for products, variant combinations, images, prices, stock, cart, orders, bookings and payments. Configure the backend in `src/js/config.js`, apply its Alembic migrations, and run the API before browsing database-backed products or using admin actions. Admin access is controlled by the backend user's `is_admin` flag; never promote accounts through a public endpoint. Payment initialization and verification must remain server-side; do not put secret keys in frontend JavaScript.
