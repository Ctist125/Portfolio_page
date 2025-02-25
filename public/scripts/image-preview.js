const imagePickerElement = document.querySelector("#image");
const imagePreviewElement = document.querySelector("#image-list img");

function updatePreview() {
  const files = imagePickerElement.files;

  if (!files || files.length === 0) {
    imagePreviewElement.style.display = "none";
    return;
  }

  const pickedFile = files[0];

  imagePreviewElement.src = URL.createObjectURL(pickedFile);
  imagePreviewElement.style.display = "block";
}

imagePickerElement.addEventListener("change", updatePreview);
