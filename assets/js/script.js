import { fieldTypes } from "./fieldtypes.js";
const { createApp } = Vue;
const draggable = window.vuedraggable;
const EditForm = createApp({
   components: {
      draggable,
   },
   data() {
      return {
         fieldTypes,
         formFields: [],
         editingField: null,
         editingFieldRef: null,
         optionsText: "",
      };
   },
   mounted() {
      this.loadSampleData();
      // VueDraggable handles everything - no manual initialization needed!
   },
   methods: {
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
         this.editingField = JSON.parse(JSON.stringify(field));
         this.editingFieldRef = field; // Keep reference for updating

         if (this.editingField.options) {
            this.optionsText = this.editingField.options.join("\n");
         } else {
            this.optionsText = "";
         }

         this.$nextTick(() => {
            const modal = new bootstrap.Modal(
               document.getElementById("editModal")
            );
            modal.show();
         });
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

         this.editingField = null;
         this.editingFieldRef = null;
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
      loadSampleData() {
         this.formFields = [
            {
               uid: "field-1767206578220-vl6ah",
               type: "heading",
               name: "field_8796964812690",
               label: "Heading",
               required: false,
               placeholder: "Enter heading",
            },
            {
               uid: "field-1767206582626-e0f0l",
               type: "number",
               name: "field_5238054626345",
               label: "Number",
               required: false,
               placeholder: "Enter number",
            },
            {
               uid: "field-1767206544836-80xa9",
               type: "container",
               name: "field_4504736307116",
               label: "Container",
               required: false,
               columns: [
                  {
                     fields: [
                        {
                           uid: "field-1767206553639-pwhof",
                           type: "heading",
                           name: "field_2036402220845",
                           label: "Heading",
                           required: false,
                           placeholder: "Enter heading",
                        },
                        {
                           uid: "field-1767206557729-2vilu",
                           type: "paragraph",
                           name: "field_3544515689756",
                           label: "Paragraph",
                           required: false,
                           placeholder: "Enter paragraph",
                        },
                        {
                           uid: "field-1767206561381-xfrqx",
                           type: "text",
                           name: "field_3333118597207",
                           label: "Text",
                           required: true,
                           placeholder: "Enter text",
                        },
                     ],
                  },
                  {
                     fields: [
                        {
                           uid: "field-1767206567652-1cosw",
                           type: "text",
                           name: "field_1617653101814",
                           label: "Text",
                           required: false,
                           placeholder: "Enter text",
                        },
                        {
                           uid: "field-1767206666281-9trg6",
                           type: "checkbox",
                           name: "field_8373769108225",
                           label: "Checkbox",
                           required: false,
                           placeholder: "Select checkbox",
                           options: ["Option 1", "Option 2"],
                        },
                     ],
                  },
                  {
                     fields: [
                        {
                           uid: "field-1767206571066-qerrp",
                           type: "paragraph",
                           name: "field_2027009058628",
                           label: "Paragraph",
                           required: false,
                           placeholder: "Enter paragraph",
                        },
                     ],
                  },
               ],
            },
            {
               uid: "field-1767206586223-8bbaj",
               type: "text",
               name: "field_9314397923278",
               label: "Text",
               required: false,
               placeholder: "Enter text",
            },
         ];
      },
   },
});

EditForm.mount("#app");
