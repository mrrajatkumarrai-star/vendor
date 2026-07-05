# Vendor Management System (Zero-Install & PIN-First)

A complete, production-ready Vendor Management System that runs directly in your browser. No Node.js, npm, or build setup required.

## How to Run
1. Double-click [index.html](file:///c:/Users/RajatKumarRai/OneDrive%20-%20Cogoport/Documents/vendor/index.html) to open it in your browser (e.g., Chrome, Edge, Safari).
2. Or use a simple local server (like VS Code "Live Server" extension, or python: `python -m http.server 8000`).

## Login PIN
- Enter the PIN **`9965`** to unlock the system.

## Database Modes
The system is built to support two database backends seamlessly:

### 1. Local Storage Mode (Default)
- Works instantly out of the box with no configuration required.
- Pre-populated with professional Freight Forwarding vendor sample data.
- Keeps all data saved locally in your browser's local storage.

### 2. Firebase Sync Mode (Optional)
- To sync data with a cloud Firebase Firestore database, click the **Local Storage** button in the top right header.
- Turn on **Enable Firebase Sync**, paste your Firebase configuration object, and save.
- The app will automatically connect and sync all data, CRUD actions, and Excel imports to your Firestore collection.
