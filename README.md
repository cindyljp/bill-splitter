# Bill Splitter 💸

A free, mobile-friendly bill splitter that helps friends divide shared meals fairly. Add items, choose who shared each item, and instantly see how much everyone owes—including service charge, SST, and rounding.

🌐 **[Open Bill Splitter](https://cindyljp.github.io/bill-splitter/)**

## ✨ Features

- 👥 **Flexible group size:** Start by entering the number of people (1–100), then add, remove, or rename participants.
- ✏️ **Easy name editing:** Use the **×** button to clear a person or item name. If you leave the field blank, it restores the default name (for example, `Person 1` or `Item 1`) when you leave the field.
- 📷 **Receipt scanning:** Take a receipt photo or upload an image, rotate it, and scan locally with Tesseract.js. Enhanced contrast, OCR line grouping, a second-pass fallback, and receipt-specific parsing help identify possible items.\n- 🔍 **Review and validate:** Edit or remove detected items, add missing rows, inspect the recognized text, and compare item totals with detected receipt totals before importing. Imported items are appended to the bill.\n- 🍽️ **Itemized bills:** Add or remove items, set each item's name, unit price (RM), and quantity.
- 🤝 **Shared items:** Select one or more people to split an item's cost equally. Each person's item subtotal updates automatically.
- 🧾 **Taxes and adjustments:** Set service charge and SST percentages, plus an optional positive or negative rounding adjustment.
- 🧮 **Automatic calculations:** See the bill subtotal, charges, grand total, and each person's share. Calculations distribute amounts to cents and warn when items are unassigned.
- 📋 **Copy summary:** Copy a formatted text breakdown with bill totals, each person's amount, and an itemized list showing quantities, unit prices, line totals, and who shared each item.
- 🖼️ **Copy as image:** Create a styled PNG summary with a blue header, total bill, taxes, participant breakdown, and bill items. The image is copied to the clipboard when supported; otherwise, the browser downloads the PNG.
- 📱 **Responsive design:** Works on desktop and mobile browsers.
- 🔄 **Reset bill:** Clear the current bill and start again.

## 🚀 How to use

1. Open **[Bill Splitter](https://cindyljp.github.io/bill-splitter/)**.
2. Enter how many people are sharing the bill and select **Start splitting**.
3. Rename participants if needed. Use **Add person** or the remove buttons to adjust the group.
4. Enter each item's name, price, and quantity manually, **or** choose **Take photo** / **Upload receipt**, scan, review the detected rows, and select **Import selected**. Use **Add item** for more entries.
5. Under **Shared by**, select everyone who shared each item.
6. Adjust **Service charge (%)**, **SST (%)**, and **Rounding** if needed.
7. Check the calculated totals and individual shares.
8. Select **Copy summary** for formatted text or **Copy as image** to share a receipt-style image.

> **Tip:** The **×** inside a name field clears its text; it does not remove the person or item. Leaving the field blank restores its default name.

## 📤 Sharing the result

**Copy summary** includes:
- Subtotal, service charge, SST, rounding, and grand total.
- The amount owed by each participant.
- Every bill item, including quantity, unit price, line total, and assigned participants.

**Copy as image** creates a PNG with the same essential breakdown in a shareable layout. On browsers that do not allow PNG clipboard writes, the image is downloaded instead. You can then share it from your downloads or photos.

## 🛠️ Technology and hosting

- **Frontend:** Vanilla HTML, CSS, and JavaScript in `index.html`.
- **Hosting:** GitHub Pages, using the `main` branch.
- **Dependencies:** No framework, build step, backend, database, or API key is required. Receipt scanning loads the free Tesseract.js library and OCR language files from a CDN on first use.

To deploy an update, edit `index.html` and push the changes to `main`. GitHub Pages will publish the updated site.

## 🔒 Privacy

Bill calculations, receipt OCR, and PNG generation happen in your browser. Receipt photos are not sent to an application server by the app. An internet connection is required to download the OCR library and language files when scanning for the first time. No account or application API key is required.

## 📌 Notes

- Prices are displayed in **Malaysian Ringgit (RM)**.
- New bills start with two editable items.
- Receipt scanning is best-effort, not guaranteed accurate. Check all detected names, quantities, prices, taxes, and totals before importing.\n- OCR is currently powered by **Tesseract.js** with image preprocessing and fallback recognition; PaddleOCR is not bundled.
- Image clipboard support varies by browser; PNG download is provided as a fallback.
