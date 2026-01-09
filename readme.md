# Vue Drag & Drop Form Builder

A dynamic **drag-and-drop form builder** built with **Vue 3 (CDN)** and **vuedraggable**, designed to create, edit, and manage complex forms visually — without any build tools.

This project supports nested layouts, reusable field schemas, live editing via modals, and JSON-based import/export, making it ideal for CMS, WordPress headless, or Laravel-integrated projects.

[Click here to preview](https://vxlrubel.github.io/vue-drag-drop-form-builder/)

---

## 🚀 Features

-  🧩 Drag & drop form fields
-  📦 Nested container / column support
-  ✏️ Edit fields using Bootstrap modal
-  🔁 Reorder fields with smooth animations
-  💾 Load form schema from JSON
-  📤 Export form structure as JSON
-  ⚡ Vue 3 via CDN (no Node / Vite required)
-  🎨 Bootstrap 5 UI

---

## 🛠️ Tech Stack

-  **Vue 3 (CDN)**
-  **vuedraggable**
-  **Bootstrap 5**
-  **JavaScript (ES Modules)**

---

## 📂 Project Structure

```
vue-drag-drop-form-builder/
│
├── index.html
├── script.js
├── sample-form.json
├── components/
│   └── EditFieldModal.js
└── assets/
```

---

## ▶️ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/vxlrubel/vue-drag-drop-form-builder.git
cd vue-drag-drop-form-builder
```

### 2️⃣ Run a Local Server (Required)

> ❗ Vue module imports will NOT work with `file://`

```bash
php -S localhost:8000
# or
npx serve
```

### 3️⃣ Open in Browser

```
http://localhost:8000
```

---

## 🧱 Field Types Supported

-  Text
-  Number
-  Heading
-  Paragraph
-  Checkbox
-  Radio
-  Select
-  Photo Upload
-  Container (multi-column layout)

---

## 📄 Load Form from JSON

Forms can be loaded dynamically from a JSON file:

```js
fetch("./sample-form.json")
   .then((res) => res.json())
   .then((data) => (this.formFields = data));
```

---

## 🧠 Use Cases

-  Form builder SaaS
-  WordPress headless forms
-  Laravel dynamic forms
-  Survey & questionnaire systems
-  CMS custom field builders

---

## 📌 Roadmap

-  [ ] Field validation rules
-  [ ] Conditional logic
-  [ ] Undo / redo
-  [ ] Backend persistence
-  [ ] Form preview mode

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Open a Pull Request

---

## 📜 License

MIT License

---

## 👨‍💻 Author

**Rubel Mahmud**  
Full‑stack Developer (Vue, Laravel, WordPress)

---

⭐ If you like this project, don’t forget to star the repository!
