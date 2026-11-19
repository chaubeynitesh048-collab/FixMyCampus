/**
 * main.js - Client-Side Interactivity for FixMyCampus
 * Features:
 * 1. Dark/Light theme toggle with persistence
 * 2. Mobile camera capture & canvas photo compression
 * 3. Smart local AI Auto-Assist (category, urgency, department, title)
 * 4. AJAX 'Me Too' upvoting
 * 5. Interactive 5-star resolution rating
 * 6. Quick role switcher modal
 * 7. Chart.js dashboard integration
 */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initUpvoting();
  initPhotoUploader();
  initAiAssist();
  initStarRating();
  initRoleSwitcher();
  initCharts();
});

/* ---------------- 1. Theme Management ---------------- */
function initTheme() {
  const toggleBtn = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("fmc-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("fmc-theme", next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById("themeIcon");
  if (icon) {
    icon.textContent = theme === "dark" ? "☀️" : "🌙";
  }
}

/* ---------------- 2. AJAX Upvoting ---------------- */
function initUpvoting() {
  document.querySelectorAll(".upvote-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const complaintId = btn.getAttribute("data-id");
      if (!complaintId) return;

      try {
        const res = await fetch(`/api/complaints/${complaintId}/upvote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        if (data.success) {
          const countSpan = btn.querySelector(".upvote-count");
          if (countSpan) countSpan.textContent = data.upvotes;
          if (data.has_upvoted) {
            btn.classList.add("upvoted");
          } else {
            btn.classList.remove("upvoted");
          }
        }
      } catch (err) {
        console.warn("Upvote error:", err);
      }
    });
  });
}

/* ---------------- 3. Photo Upload & Compression ---------------- */
function initPhotoUploader() {
  const dropzone = document.getElementById("photoDropzone");
  const fileInput = document.getElementById("photoInput");
  const previewGrid = document.getElementById("photoPreviews");
  const cameraBtn = document.getElementById("cameraBtn");
  const cameraModal = document.getElementById("cameraModal");
  const videoElem = document.getElementById("cameraVideo");
  const captureBtn = document.getElementById("cameraCaptureBtn");
  const closeCamBtn = document.getElementById("cameraCloseBtn");

  if (!dropzone || !fileInput || !previewGrid) return;

  let stream = null;
  const maxPhotos = 3;
  let selectedFiles = [];

  dropzone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async () => {
    if (fileInput.files) {
      for (const file of Array.from(fileInput.files)) {
        if (selectedFiles.length >= maxPhotos) break;
        if (!file.type.startsWith("image/")) continue;
        const compressed = await compressImage(file);
        selectedFiles.push(compressed);
      }
      renderPreviews();
    }
  });

  // Camera Capture via getUserMedia
  if (cameraBtn && cameraModal && videoElem && captureBtn) {
    cameraBtn.addEventListener("click", async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false
        });
        videoElem.srcObject = stream;
        cameraModal.style.display = "flex";
      } catch (err) {
        // Fallback to native camera input capture
        fileInput.setAttribute("capture", "environment");
        fileInput.click();
      }
    });

    captureBtn.addEventListener("click", () => {
      if (!videoElem.videoWidth) return;
      const canvas = document.createElement("canvas");
      canvas.width = videoElem.videoWidth;
      canvas.height = videoElem.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoElem, 0, 0);

      canvas.toBlob((blob) => {
        const file = new File([blob], `camera_${Date.now()}.jpg`, { type: "image/jpeg" });
        if (selectedFiles.length < maxPhotos) {
          selectedFiles.push(file);
          renderPreviews();
        }
        stopCamera();
      }, "image/jpeg", 0.85);
    });

    if (closeCamBtn) {
      closeCamBtn.addEventListener("click", stopCamera);
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    if (cameraModal) cameraModal.style.display = "none";
  }

  function renderPreviews() {
    previewGrid.innerHTML = "";
    selectedFiles.forEach((file, index) => {
      const thumb = document.createElement("div");
      thumb.className = "preview-thumb";

      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);

      const removeBtn = document.createElement("button");
      removeBtn.className = "preview-remove";
      removeBtn.innerHTML = "×";
      removeBtn.type = "button";
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedFiles.splice(index, 1);
        renderPreviews();
      });

      thumb.appendChild(img);
      thumb.appendChild(removeBtn);
      previewGrid.appendChild(thumb);
    });

    // Sync files with DataTransfer so form POST receives them
    const dt = new DataTransfer();
    selectedFiles.forEach((f) => dt.items.add(f));
    fileInput.files = dt.files;
  }
}

// Client-side Canvas Image Compression
function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
    };
  });
}

/* ---------------- 4. Local Smart AI Auto-Assist ---------------- */
function initAiAssist() {
  const assistBtn = document.getElementById("aiAssistBtn");
  const descInput = document.getElementById("descriptionInput");
  const resultBox = document.getElementById("aiResultBox");
  const applyBtn = document.getElementById("aiApplyBtn");

  if (!assistBtn || !descInput || !resultBox) return;

  let currentSuggestion = null;

  assistBtn.addEventListener("click", async () => {
    const desc = descInput.value.trim();
    if (!desc) {
      alert("Please write a few words describing the problem first so the AI can analyze it.");
      descInput.focus();
      return;
    }

    assistBtn.disabled = true;
    assistBtn.innerHTML = "✨ Analyzing...";

    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc })
      });
      const data = await res.json();
      if (data.success) {
        currentSuggestion = data;
        document.getElementById("aiSuggestedTitle").textContent = data.suggestedTitle;
        document.getElementById("aiSuggestedCategory").textContent = data.category;
        document.getElementById("aiSuggestedUrgency").textContent = data.urgency;
        document.getElementById("aiSuggestedDept").textContent = data.suggestedDepartment;
        document.getElementById("aiSuggestedSummary").textContent = data.oneLineSummary;
        resultBox.style.display = "block";
      }
    } catch (err) {
      console.warn("AI assist failed:", err);
    } finally {
      assistBtn.disabled = false;
      assistBtn.innerHTML = "✨ AI Auto-Assist";
    }
  });

  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      if (!currentSuggestion) return;
      const titleInput = document.getElementById("titleInput");
      const catSelect = document.getElementById("categorySelect");
      const urgSelect = document.getElementById("urgencySelect");
      const deptSelect = document.getElementById("deptSelect");

      if (titleInput && !titleInput.value.trim()) titleInput.value = currentSuggestion.suggestedTitle;
      if (catSelect) catSelect.value = currentSuggestion.category;
      if (urgSelect) urgSelect.value = currentSuggestion.urgency;
      if (deptSelect) deptSelect.value = currentSuggestion.suggestedDepartment;

      resultBox.style.display = "none";
    });
  }
}

/* ---------------- 5. Star Rating ---------------- */
function initStarRating() {
  const container = document.getElementById("starRatingContainer");
  const hiddenInput = document.getElementById("ratingInput");
  if (!container || !hiddenInput) return;

  const stars = container.querySelectorAll(".star");
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const val = parseInt(star.getAttribute("data-val"), 10);
      hiddenInput.value = val;
      updateStars(val);
    });

    star.addEventListener("mouseenter", () => {
      const val = parseInt(star.getAttribute("data-val"), 10);
      updateStars(val);
    });
  });

  container.addEventListener("mouseleave", () => {
    const current = parseInt(hiddenInput.value, 10) || 5;
    updateStars(current);
  });

  function updateStars(val) {
    stars.forEach((s) => {
      const sVal = parseInt(s.getAttribute("data-val"), 10);
      if (sVal <= val) {
        s.classList.add("active");
        s.textContent = "★";
      } else {
        s.classList.remove("active");
        s.textContent = "☆";
      }
    });
  }
}

/* ---------------- 6. Role Switcher ---------------- */
function initRoleSwitcher() {
  const openBtn = document.getElementById("roleSwitcherBtn");
  const modal = document.getElementById("roleSwitcherModal");
  const closeBtn = document.getElementById("roleCloseBtn");

  if (openBtn && modal) {
    openBtn.addEventListener("click", () => (modal.style.display = "flex"));
    if (closeBtn) closeBtn.addEventListener("click", () => (modal.style.display = "none"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  }
}

/* ---------------- 7. Dashboard Charts (Chart.js) ---------------- */
function initCharts() {
  const catCanvas = document.getElementById("categoryChart");
  const locCanvas = document.getElementById("locationChart");
  const urgCanvas = document.getElementById("urgencyChart");

  if (!catCanvas || typeof Chart === "undefined") return;

  // Category Chart
  try {
    const catData = JSON.parse(catCanvas.getAttribute("data-json") || "{}");
    new Chart(catCanvas, {
      type: "bar",
      data: {
        labels: Object.keys(catData),
        datasets: [{
          label: "Complaints",
          data: Object.values(catData),
          backgroundColor: ["#10b981", "#0d9488", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#64748b"],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
  } catch (e) {
    console.warn("Chart render err:", e);
  }

  // Location Chart (Doughnut)
  if (locCanvas) {
    try {
      const locData = JSON.parse(locCanvas.getAttribute("data-json") || "{}");
      new Chart(locCanvas, {
        type: "doughnut",
        data: {
          labels: Object.keys(locData),
          datasets: [{
            data: Object.values(locData),
            backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#94a3b8"]
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: "bottom" } }
        }
      });
    } catch (e) {}
  }

  // Urgency Chart (Bar)
  if (urgCanvas) {
    try {
      const urgData = JSON.parse(urgCanvas.getAttribute("data-json") || "{}");
      new Chart(urgCanvas, {
        type: "bar",
        data: {
          labels: ["Critical", "High", "Medium", "Low"],
          datasets: [{
            label: "Incident Urgency",
            data: [
              urgData["Critical"] || 0,
              urgData["High"] || 0,
              urgData["Medium"] || 0,
              urgData["Low"] || 0
            ],
            backgroundColor: ["#ef4444", "#f97316", "#f59e0b", "#10b981"],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
      });
    } catch (e) {}
  }
}
