# Bill Splitter 💸

A free, mobile-friendly bill-splitting calculator for shared meals and expenses. Enter items manually or scan a receipt, choose who shared each item, and see how much everyone owes—including service charge, SST, and rounding.

🌐 **[Open Bill Splitter](https://cindyljp.github.io/bill-splitter/)**

## ✨ Features

- 👥 **Flexible group size:** Choose 1–100 participants when starting a bill, then add, remove, or rename people.
- ✏️ **Clearable names:** Use the **×** button inside person and item name fields. If a field is left blank, its default name (such as `Person 1` or `Item 1`) returns when you leave the field.
- 🍽️ **Manual item entry:** Add or remove items, set their names, unit prices in RM, and quantities.
- 📷 **Receipt photo scanning:** Take a photo, upload an image, drag and drop a receipt, or paste an image using Ctrl+V / ⌘V on desktop. On mobile devices, a dedicated **Paste image** button appears for supported browsers. Rotate the preview and scan using free, browser-based OCR.
- 🔎 **Editable scan results:** Select, edit, add, or remove detected receipt items before importing them. Imported items are appended to the existing bill, and you can then choose who shared them.
- 🖼️ **Receipt controls:** Clean, responsive action buttons and a custom confirmation dialog when removing a receipt photo. Removing the image discards unimported detections but preserves already imported bill items.
- 🤝 **Shared items:** Assign an item to one or more participants to split its cost equally.\n- 💸 **Who pays whom:** Use the dedicated **Who paid first?** section to select multiple items and assign them to one payer at once. Repeat for other payers. A settlement section calculates reimbursements between participants, including proportional service charge, SST, and rounding. Both text and image summaries include payment instructions when all priced items have a payer and at least one person sharing them.
- 🧾 **Taxes and adjustments:** Configure service charge and SST percentages and an optional positive or negative rounding adjustment.
- 🧮 **Live calculations:** Automatically update the subtotal, charges, grand total, and each participant's share, with a warning for unassigned items.
- 📋 **Copy summary:** Copy a formatted text breakdown including charges, each person's share, and itemized details with quantities, unit prices, line totals, and assigned people.
- 🎨 **Copy as image:** Copy a receipt-style PNG containing the bill breakdown, participant totals, and itemized list. When clipboard image copying isn't supported, download the PNG instead.
- 📱 **Responsive interface:** Designed for mobile and desktop browsers, with a custom browser-tab favicon.
- 🔄 **Reset:** Start a fresh bill.

## 🚀 How to use

1. Open **[Bill Splitter](https://cindyljp.github.io/bill-splitter/)**.
2. Enter the number of people sharing the bill and select **Start splitting**.
3. Add or rename participants as needed.
4. Add items manually, or provide a receipt image using **Take photo**, **Upload receipt**, drag-and-drop, or desktop keyboard paste (**Ctrl+V** / **⌘V**). On mobile, use the **Paste image** button if your browser supports clipboard image access. If pasting is unavailable, use **Upload receipt**.
5. For receipt scanning, rotate the image if needed and select **Scan receipt**. Review the detected items, correct their names, quantities, and unit prices, then select **Import selected**. You can add or remove detected rows. If the receipt clearly identifies a service charge or SST rate, importing also updates the corresponding percentage fields; otherwise their existing values remain unchanged.
6. Under **Shared by**, select the participants who shared each bill item. In the **Who paid first?** section, select one or more items, choose who paid, and select **Assign payer**. Repeat for different payers.
7. Adjust **Service charge (%)**, **SST (%)**, and **Rounding** if applicable.
8. Review the totals and the **Who pays whom?** section at the bottom to see who should reimburse whom. Use **Copy summary** or **Copy as image** to share the bill breakdown. Both text and image exports include settlements when payer details are complete.

> **Tip:** The **×** inside a name field clears the text without deleting the person or item. Leaving the field blank restores its default name.

## 📷 Receipt scanning

Receipt scanning accepts camera photos, image uploads, drag-and-drop files, and clipboard images (outside text-entry fields). **Paste image** is shown on detected mobile devices and hidden on desktop, where keyboard paste remains available. Mobile detection uses browser device information and may vary on tablets or browsers using desktop mode. Clipboard image access depends on browser permissions and support; **Upload receipt** is the fallback. It uses **Tesseract.js** locally in the browser. It applies image rotation and contrast enhancement, uses OCR word positions to reconstruct lines, and attempts a second recognition pass for difficult images.

After scanning, you can review and edit detected item rows before importing. The scanner also attempts to detect labeled service charge and SST percentages (or infer them from a labeled charge amount and subtotal). Only detected rates are applied when importing; check these fields against your receipt. The scanner intentionally keeps the review screen simple: it does **not** display raw OCR text or a price comparison summary.

If you select **Remove image**, a custom confirmation dialog lets you keep or remove the photo. Confirming removes the photo and any unimported detected rows; it does **not** delete items already added to your bill.

**Accuracy note:** OCR and receipt parsing are best-effort. Receipts with faint printing, unusual layouts, or prices on separate lines can be misread. Always check the detected items and prices before importing. The app may still ask for confirmation if an imported selection differs from a subtotal detected in the receipt.

## 📤 Sharing your bill

**Copy summary** creates a readable text breakdown of the subtotal, service charge, SST, rounding, grand total, each person's amount, and every bill item with its quantity, unit price, line total, and sharing participants. When payer information is complete, it also lists who should pay whom.

**Copy as image** generates a styled PNG with a blue header, participant breakdown, itemized bill, and footer. When payer details are complete, the PNG also includes a **Who pays whom?** section below the bill items. The app tries to copy the PNG to your clipboard; if that is unsupported, it downloads the image for sharing.

## 🛠️ Technology and hosting

- **Frontend:** Vanilla HTML, CSS, and JavaScript.
- **Files:** `index.html` (main app and styling), `receipt-scanner.js` (receipt OCR and review logic), `favicon.svg` (site icon).
- **OCR:** Tesseract.js 5, loaded from a CDN when needed. OCR language files are downloaded on first use.
- **Hosting:** GitHub Pages from the `main` branch.
- **Requirements:** No framework, build process, application backend, database, account, or API key.

To publish changes, commit and push the updated files to `main`; GitHub Pages will deploy them.

## 🔒 Privacy

Bill calculations, receipt recognition, and PNG generation run in the browser. The app does not upload receipt photos or bill details to an application API. An internet connection is needed to load the OCR library and language data from external hosting.

## 📌 Notes

- Currency is **Malaysian Ringgit (RM)**.
- A new bill begins with two editable items.
- OCR is currently powered by **Tesseract.js**, not PaddleOCR or a cloud vision AI.
- Image clipboard support varies by browser. For receipt input, use **Upload receipt** when paste is blocked; for exported PNGs, downloading the image is the fallback.
