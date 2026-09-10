# Conniecomes Beauty Salon — HTML/CSS/JavaScript Frontend

This is a frontend-only e-commerce and salon-booking website built with plain HTML5, CSS3 and vanilla JavaScript.

## Run
Open `index.html` directly in a browser, or serve the folder with a simple local server.

## Included
- Responsive luxury salon storefront
- Shop and category navigation
- Frontals: 13x4, 13x6, glueless
- Closures: 2x6, 4x4, 5x5, 6x6
- Straight and curly hair
- Wigs
- Product detail pages
- Cart with localStorage persistence
- Checkout
- Card and Mobile Money payment UI
- Appointment booking
- Services, About, Contact and Account pages
- Image placeholders instead of real images

## Backend integration
The UI is intentionally backend-independent. Replace the mock product data and localStorage operations in `js/app.js` with calls to the FastAPI API. Payment initialization/verification should also happen through the backend/payment provider; do not put secret keys in frontend JavaScript.
