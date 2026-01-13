import { fieldTypes } from "./fieldtypes.js";
const { createApp } = Vue;
const draggable = window.vuedraggable;
const EditForm = createApp({
   components: {
      draggable,
   },
   data() {
      return {
         elementsListVisible: true,
         fieldTypes,
         formFields: [],
         editingField: null,
         editingFieldRef: null,
         optionsText: "",
         sidebarWidth: 270,
         isResizing: false,
         minWidth: 270,
         maxWidth: 500,
      };
   },
   mounted() {
      this.loadSampleData();
      // VueDraggable handles everything - no manual initialization needed!
   },
   methods: {
      startResize() {
         this.isResizing = true;
         document.body.style.cursor = "col-resize";

         document.addEventListener("mousemove", this.resize);
         document.addEventListener("mouseup", this.stopResize);
      },
      resize(e) {
         if (!this.isResizing) return;

         const newWidth = e.clientX;

         if (newWidth >= this.minWidth && newWidth <= this.maxWidth) {
            this.sidebarWidth = newWidth;
         }
      },
      stopResize() {
         this.isResizing = false;
         document.body.style.cursor = "default";

         document.removeEventListener("mousemove", this.resize);
         document.removeEventListener("mouseup", this.stopResize);
      },
      initEditField() {
         let field = null;
         if (this.formFields.length === 0) {
            this.editingField = null;
            this.editingFieldRef = null;
            alert("No fields to edit. Please add a field first.");
            return;
         }
         this.elementsListVisible = false;
         if (!this.editingField) {
            field = this.formFields[0];
         } else {
            if (this.editingFieldRef) {
               field = this.editingFieldRef;
            } else {
               field = this.formFields.find(
                  (f) => f.uid === this.editingField.uid
               );
            }
         }

         this.editingField = JSON.parse(JSON.stringify(field));
         this.editingFieldRef = field;

         if (this.editingField.options) {
            this.optionsText = this.editingField.options.join("\n");
         } else {
            this.optionsText = "";
         }
      },
      onFieldAdd(evt) {
         // When field is added from palette, create a new field
         if (evt.added && evt.added.element.type) {
            const index = evt.added.newIndex;
            const type = evt.added.element.type;
            const newField = this.createField(type);
            this.formFields.splice(index, 1, newField);
         }
      },

      onNestedFieldAdd(evt, columnFields) {
         // When field is added to container column
         if (evt.added && evt.added.element.type) {
            const index = evt.added.newIndex;
            const type = evt.added.element.type;
            const newField = this.createField(type);
            columnFields.splice(index, 1, newField);
         }
      },

      createField(fieldOrType) {
         // If it's a fieldType object from palette (has 'type' property and 'label')
         const type = fieldOrType.type || fieldOrType;

         const uid = `field-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 5)}`;
         const name = `field_${Math.random().toString().substr(2, 13)}`;

         const fieldTypeInfo = this.fieldTypes.find((f) => f.type === type);
         const label = fieldTypeInfo ? fieldTypeInfo.label : type;

         const baseField = {
            uid,
            type,
            name,
            label,
            required: false,
            placeholder: `Enter ${type}`,
         };

         if (type === "select" || type === "radio" || type === "checkbox") {
            baseField.options = ["Option 1", "Option 2"];
         }

         if (type === "container") {
            baseField.columns = [{ fields: [] }, { fields: [] }];
         }
         if (type === "table") {
            baseField.table = {
               headers: ["Column 1", "Column 2", "Column 3"],
               rows: [
                  [{ fields: [] }, { fields: [] }, { fields: [] }],
                  [{ fields: [] }, { fields: [] }, { fields: [] }],
               ],
            };
         }

         return baseField;
      },

      removeField(index) {
         if (confirm("Are you sure you want to remove this field?")) {
            this.formFields.splice(index, 1);
         }
      },

      removeNestedField(container, columnIdx, fieldIdx) {
         if (confirm("Are you sure you want to remove this field?")) {
            container.columns[columnIdx].fields.splice(fieldIdx, 1);
         }
      },

      addColumn(container) {
         container.columns.push({ fields: [] });
      },

      removeColumn(container, columnIdx) {
         if (container.columns[columnIdx].fields.length > 0) {
            if (
               !confirm(
                  "This column contains fields. Are you sure you want to remove it?"
               )
            ) {
               return;
            }
         }
         container.columns.splice(columnIdx, 1);
      },

      editField(field) {
         // Create a deep copy to avoid reference issues
         this.elementsListVisible = false;
         this.editingField = JSON.parse(JSON.stringify(field));
         this.editingFieldRef = field; // Keep reference for updating

         if (this.editingField.options) {
            this.optionsText = this.editingField.options.join("\n");
         } else {
            this.optionsText = "";
         }
      },

      saveField() {
         if (
            this.editingField.type === "select" ||
            this.editingField.type === "radio" ||
            this.editingField.type === "checkbox"
         ) {
            this.editingField.options = this.optionsText
               .split("\n")
               .filter((opt) => opt.trim());
         }

         // Update the original field reference
         if (this.editingFieldRef) {
            Object.assign(this.editingFieldRef, this.editingField);
         }

         // this.editingField = null;
         // this.editingFieldRef = null;
      },

      exportJSON() {
         const json = JSON.stringify(this.formFields, null, 4);
         const blob = new Blob([json], { type: "application/json" });
         const url = URL.createObjectURL(blob);
         const a = document.createElement("a");
         a.href = url;
         a.download = "form-structure.json";
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(url);

         // Also show in console
         console.log("Exported JSON:", json);
         alert("Form JSON exported! Check your downloads folder.");
      },

      clearAll() {
         if (confirm("Are you sure you want to clear all fields?")) {
            this.formFields = [];
         }
      },
      triggerPhotoUpload(fieldUid) {
         const fileInput = document.getElementById("photo-" + fieldUid);
         if (fileInput) {
            fileInput.click();
         }
      },
      handlePhotoUpload(event, field) {
         const file = event.target.files[0];
         if (!file) return;

         // Validate file type
         if (field.acceptedTypes) {
            const acceptedTypes = field.acceptedTypes
               .split(",")
               .map((t) => t.trim());
            if (
               !acceptedTypes.some((type) =>
                  file.type.match(type.replace("*", ".*"))
               )
            ) {
               alert("Please select a valid image file type.");
               return;
            }
         }

         // Validate file size
         const maxSize = (field.maxSize || 5) * 1024 * 1024; // Convert MB to bytes
         if (file.size > maxSize) {
            alert(`File size must be less than ${field.maxSize || 5}MB`);
            return;
         }

         // Read and store the image
         const reader = new FileReader();
         reader.onload = (e) => {
            field.uploadedPhoto = e.target.result;
            field.photoName = file.name;
            field.photoSize = (file.size / 1024).toFixed(2) + " KB";

            // Force Vue to update
            this.$forceUpdate();
         };
         reader.readAsDataURL(file);
      },
      removePhoto(field) {
         if (confirm("Remove this photo?")) {
            field.uploadedPhoto = null;
            field.photoName = null;
            field.photoSize = null;

            // Reset file input
            const fileInput = document.getElementById("photo-" + field.uid);
            if (fileInput) {
               fileInput.value = "";
            }

            this.$forceUpdate();
         }
      },

      addTableRow(field) {
         const newRow = [];
         for (let i = 0; i < field.table.headers.length; i++) {
            newRow.push({ fields: [] });
         }
         field.table.rows.push(newRow);
      },

      removeTableRow(field, rowIdx) {
         if (field.table.rows.length <= 1) {
            alert("Table must have at least one row");
            return;
         }
         if (confirm("Are you sure you want to remove this row?")) {
            field.table.rows.splice(rowIdx, 1);
         }
      },

      addTableColumn(field) {
         field.table.headers.push(`Column ${field.table.headers.length + 1}`);
         field.table.rows.forEach((row) => {
            row.push({ fields: [] });
         });
      },

      removeTableColumn(field, colIdx) {
         if (field.table.headers.length <= 1) {
            alert("Table must have at least one column");
            return;
         }
         if (confirm("Are you sure you want to remove this column?")) {
            field.table.headers.splice(colIdx, 1);
            field.table.rows.forEach((row) => {
               row.splice(colIdx, 1);
            });
         }
      },

      updateTableHeader(field, colIdx, value) {
         field.table.headers[colIdx] = value;
      },

      removeTableCellField(field, rowIdx, colIdx, fieldIdx) {
         if (confirm("Are you sure you want to remove this field?")) {
            field.table.rows[rowIdx][colIdx].fields.splice(fieldIdx, 1);
         }
      },

      async loadSampleData() {
         try {
            const response = await fetch("sample-form.json");

            if (!response.ok) throw new Error("Failed to load form data");

            this.formFields = await response.json();
         } catch (error) {
            console.error("Form load error:", error);
         }
      },
   },
});

EditForm.mount("#app");
