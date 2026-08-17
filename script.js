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

// ================================
// SUBMIT FORM
// ================================

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    if (!validateFile(codmInput)) return;

    if (!validateFile(instagramInput)) return;

    submitButton.disabled = true;

    submitButton.innerHTML = "Submitting...";

    const formData = new FormData(form);

    try {

        const response = await fetch(FORMSPREE_ENDPOINT, {

            method: "POST",

            body: formData,

            headers: {

                Accept: "application/json"

            }

        });

        if (response.ok) {

            popup.style.display = "flex";

            form.reset();

            codmPreview.style.display = "none";
            instagramPreview.style.display = "none";

        }

        else {

            alert("Submission failed. Please try again.");

        }

    }

    catch (error) {

        alert("Unable to connect to Formspree.");

    }

    submitButton.disabled = false;

    submitButton.innerHTML = "Submit Application";

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
