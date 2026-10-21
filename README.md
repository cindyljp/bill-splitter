# Bill Splitter 💸

A simple, mobile-friendly bill splitter to share expenses, split items, and calculate taxes fairly.

🌐 **<a href="https://cindyljp.github.io/bill-splitter/" target="_blank" rel="noopener noreferrer">Open Bill Splitter</a>**

## Features

- 📸 Scan a receipt using your phone camera or upload an image, review OCR-detected items, and import them into the bill.

- 👥 Choose how many people are splitting the bill when you start, then add, remove, or rename participants.
- 🍽️ Add bill items with prices and quantities, and assign each item to one or multiple people.
- 🧾 Customize service charge and SST percentages.
- 🪙 Enter an optional rounding adjustment (blank by default; supports positive or negative amounts).
- 🧮 Automatically update each person's share, including taxes and rounding.
- 📋 Copy the bill summary to share with friends.
- 📱 Responsive layout for mobile and desktop browsers.

## How to use

1. Open the <a href="https://cindyljp.github.io/bill-splitter/" target="_blank" rel="noopener noreferrer">Bill Splitter website</a>.
2. Enter the number of people splitting the bill, then rename or add people as needed.
3. Enter bill items manually, or take/upload a receipt photo, review the detected items and import them. Then select who shares each item.
4. Adjust service charge, SST, or the optional rounding amount.
5. Review each person's total and copy the summary.

## Hosting

This is a static website hosted with **GitHub Pages** from `index.html` on the `main` branch. No build process, account, or backend is required.

To publish changes, update `index.html` and push to `main`. GitHub Pages will redeploy the site.

## Privacy

Calculations and receipt OCR run in the browser. Receipt images are not uploaded to an application server. The OCR library and language model are loaded from external hosting when scanning, so an internet connection is required to initialize scanning. No login or database is required.
