// ================================
// CONFIGURATION
// ================================

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mjybayjk";

// ================================
// ELEMENTS
// ================================

const form = document.getElementById("applicationForm");

const popup = document.getElementById("popup");
const closePopup = document.getElementById("closePopup");

const codmInput = document.getElementById("codmScreenshot");
const instagramInput = document.getElementById("instagramProof");

const codmPreview = document.getElementById("codmPreview");
const instagramPreview = document.getElementById("instagramPreview");

const submitButton = document.querySelector(".submit-btn");

// ================================
// IMAGE PREVIEW
// ================================

function previewImage(input, preview) {

    const file = input.files[0];

    if (!file) {

        preview.style.display = "none";
        preview.src = "";

        return;

    }

    const reader = new FileReader();

    reader.onload = function (e) {

        preview.src = e.target.result;
        preview.style.display = "block";

    };

    reader.readAsDataURL(file);

}

codmInput.addEventListener("change", () => {

    previewImage(codmInput, codmPreview);

});

instagramInput.addEventListener("change", () => {

    previewImage(instagramInput, instagramPreview);

});

// ================================
// FILE SIZE VALIDATION
// 5MB LIMIT
// ================================

function validateFile(input) {

    const file = input.files[0];

    if (!file) return true;

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {

        alert("Each image must be less than 5MB.");

        input.value = "";

        return false;

    }

    return true;

}

codmInput.addEventListener("change", () => {

    validateFile(codmInput);

});

instagramInput.addEventListener("change", () => {

    validateFile(instagramInput);

});

async function uploadToCloudinary(file) {

    const cloudinaryUrl =
        "https://api.cloudinary.com/v1_1/uzj8afki/image/upload";

    const uploadData = new FormData();

    uploadData.append("file", file);
    uploadData.append(
        "upload_preset",
        "lux-noctis-applications"
    );

    const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: uploadData
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Cloudinary upload error:", data);

        throw new Error(
            data.error?.message ||
            "Image upload failed."
        );
    }

    return data.secure_url;
}

// ================================
// SUBMIT FORM
// ================================

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    // Validate screenshots
    if (!validateFile(codmInput)) return;
    if (!validateFile(instagramInput)) return;

    const codmFile = codmInput.files[0];
    const instagramFile = instagramInput.files[0];

    if (!codmFile || !instagramFile) {
        alert("Please upload both required screenshots.");
        return;
    }

    submitButton.disabled = true;
    submitButton.innerHTML = "Uploading screenshots...";

    try {

        // ================================
        // UPLOAD CODM SCREENSHOT
        // ================================

        const codmUrl = await uploadToCloudinary(codmFile);

        submitButton.innerHTML = "Uploading Instagram proof...";

        // ================================
        // UPLOAD INSTAGRAM SCREENSHOT
        // ================================

        const instagramUrl =
            await uploadToCloudinary(instagramFile);

        submitButton.innerHTML = "Submitting application...";

        // ================================
        // CREATE NORMAL TEXT DATA
        // ================================

        const formData = new FormData(form);

        // Get all normal form fields
        const submissionData = {};

        for (const [key, value] of formData.entries()) {

            // Ignore the actual image files
            if (
                key !== "codmScreenshot" &&
                key !== "instagramProof"
            ) {
                submissionData[key] = value;
            }

        }

        // Add Cloudinary URLs instead
        submissionData.codmScreenshotUrl = codmUrl;
        submissionData.instagramProofUrl = instagramUrl;

        // ================================
        // SEND TEXT DATA TO FORMSPREE
        // ================================

        const response = await fetch(
            FORMSPREE_ENDPOINT,
            {
                method: "POST",

                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(submissionData)
            }
        );

        const data = await response.json().catch(() => null);

        console.log("Formspree status:", response.status);
        console.log("Formspree response:", data);

        // ================================
        // HANDLE ERROR
        // ================================

        if (!response.ok) {

            const errorMessage =
                data?.errors
                    ?.map(error =>
                        error.message || error.code
                    )
                    .join("\n")
                ||
                "Formspree submission failed.";

            throw new Error(errorMessage);
        }

        // ================================
        // SUCCESS
        // ================================

        popup.style.display = "flex";

        form.reset();

        codmPreview.src = "";
        codmPreview.style.display = "none";

        instagramPreview.src = "";
        instagramPreview.style.display = "none";

    } catch (error) {

        console.error(
            "Application submission error:",
            error
        );

        alert(
            "Submission failed.\n\n" +
            error.message
        );

    } finally {

        submitButton.disabled = false;

        submitButton.innerHTML =
            "Submit Application";

    }

});

// ================================
// POPUP
// ================================

closePopup.addEventListener("click", () => {

    popup.style.display = "none";

});

window.addEventListener("click", (e) => {

    if (e.target === popup) {

        popup.style.display = "none";

    }

});

// ================================
// SCROLL ANIMATION
// ================================

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {

    threshold: 0.15

});

document.querySelectorAll(".section, .card, form").forEach(el => {

    el.classList.add("hidden");

    observer.observe(el);

});
