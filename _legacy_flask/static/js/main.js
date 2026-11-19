/**
 * main.js - Client-side interactivity for FixMyCampus
 * Handles:
 * 1. Mobile navigation menu toggle
 * 2. Instant photo upload preview & remove
 * 3. Dismissing flash notifications
 * 4. Auto-submitting status updates in the admin dashboard
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Mobile Navigation Toggle
  const mobileToggle = document.getElementById("mobileNavToggle");
  const navLinks = document.getElementById("navLinks");

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }

  // 2. Photo Upload Preview & Interaction
  const photoInput = document.getElementById("photoInput");
  const uploadDropzone = document.getElementById("uploadDropzone");
  const previewContainer = document.getElementById("previewContainer");
  const previewImage = document.getElementById("previewImage");
  const removePhotoBtn = document.getElementById("removePhotoBtn");

  if (uploadDropzone && photoInput) {
    // Clicking the styled dropzone opens the native file dialog
    uploadDropzone.addEventListener("click", (e) => {
      if (e.target !== removePhotoBtn && !removePhotoBtn?.contains(e.target)) {
        photoInput.click();
      }
    });

    // Drag-and-drop enhancements
    ["dragenter", "dragover"].forEach((eventName) => {
      uploadDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        uploadDropzone.style.borderColor = "var(--primary)";
        uploadDropzone.style.backgroundColor = "var(--primary-light)";
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      uploadDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        uploadDropzone.style.borderColor = "";
        uploadDropzone.style.backgroundColor = "";
      });
    });

    uploadDropzone.addEventListener("drop", (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        photoInput.files = e.dataTransfer.files;
        handleFilePreview(photoInput.files[0]);
      }
    });

    // File selection change
    photoInput.addEventListener("change", () => {
      if (photoInput.files && photoInput.files[0]) {
        handleFilePreview(photoInput.files[0]);
      }
    });

    // Remove selected photo
    if (removePhotoBtn) {
      removePhotoBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        photoInput.value = "";
        previewContainer.style.display = "none";
        previewImage.src = "";
        uploadDropzone.style.display = "block";
      });
    }
  }

  function handleFilePreview(file) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, JPEG, GIF, WEBP).");
      photoInput.value = "";
      return;
    }

    // Check file size (16MB limit)
    if (file.size > 16 * 1024 * 1024) {
      alert("Selected photo is larger than 16MB. Please choose a smaller photo.");
      photoInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      previewContainer.style.display = "block";
      uploadDropzone.style.display = "none";
    };
    reader.readAsDataURL(file);
  }

  // 3. Flash Message Dismiss Button
  const flashCloseButtons = document.querySelectorAll(".flash-close-btn");
  flashCloseButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const alert = btn.closest(".flash-message");
      if (alert) {
        alert.style.opacity = "0";
        setTimeout(() => alert.remove(), 200);
      }
    });
  });

  // 4. Admin Status Select Auto-Submit
  const autoStatusSelects = document.querySelectorAll(".auto-submit-status");
  autoStatusSelects.forEach((select) => {
    select.addEventListener("change", (e) => {
      const form = select.closest("form");
      if (form) {
        form.submit();
      }
    });
  });
});
