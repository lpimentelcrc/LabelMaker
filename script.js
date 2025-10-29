// Firebase Boilerplate (required for environment, though not strictly used for data storage here)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
// getFirestore is imported but not used in the provided logic
// import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Firebase Setup ---
// These global variables are expected to be injected by the environment if Firebase is required.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app, auth;

if (firebaseConfig) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Initial Auth Check
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase Auth Error:", error);
            }
        }
    });
}

// --- Application Logic ---

let ingredients = [
    // UPDATED: Added default 'unit' property
    { id: Date.now() + 1, name: 'Diced Chicken Breast', nutritionImage: null, unit: 'oz' },
    { id: Date.now() + 2, name: 'Stir-fry Vegetable Mix', nutritionImage: null, unit: 'oz' },
    { id: Date.now() + 3, name: 'Low Sodium Soy Sauce', nutritionImage: null, unit: 'oz' }
];

window.handleImageUpload = function(event, id) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const index = ingredients.findIndex(ing => ing.id === id);
            if (index > -1) {
                // Store the base64 data URL
                ingredients[index].nutritionImage = e.target.result;
                renderIngredientInputs(); // Re-render to show image preview
                updateLabel();
            }
        };
        reader.readAsDataURL(file);
    }
}

window.addIngredient = function() {
    const MAX_INGREDIENTS = 5;
    // Removed the 'return' for MAX_INGREDIENTS to match the original code's behavior: 
    // allow adding more than 5, but they won't show a nutrition label.

    // UPDATED: Added default 'unit' property for new ingredients
    ingredients.push({ id: Date.now(), name: '', nutritionImage: null, unit: 'oz' });
    renderIngredientInputs();
    updateLabel();
}

window.removeIngredient = function(id) {
    ingredients = ingredients.filter(ing => ing.id !== id);
    renderIngredientInputs();
    updateLabel();
}

// UPDATED: Handle both 'name' and new 'unit' fields
window.updateIngredient = function(id, field, value) {
    const index = ingredients.findIndex(ing => ing.id === id);
    if (index > -1) {
        if (field === 'name') {
            ingredients[index].name = value;
        } else if (field === 'unit') {
            ingredients[index].unit = value;
        }
        updateLabel();
    }
}

function renderIngredientInputs() {
    const container = document.getElementById('ingredientsContainer');
    container.innerHTML = '';
    
    ingredients.forEach(ing => {
        const div = document.createElement('div');
        div.className = 'flex items-stretch space-x-2 border-b pb-3';

        const imagePreview = ing.nutritionImage 
            ? `<img src="${ing.nutritionImage}" class="h-10 w-auto mx-auto object-contain" alt="Label Preview">` 
            : `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg><span class="text-gray-500 text-xs mt-1">Upload Label</span>`;

        div.innerHTML = `
            <div class="flex-1 flex space-x-2">
                <input type="text" value="${ing.name}" oninput="updateIngredient(${ing.id}, 'name', this.value)" 
                        placeholder="Ingredient Name" maxlength="250" class="flex-grow rounded-lg border-gray-300 shadow-sm p-2 border">
                <input type="text" value="${ing.unit || 'oz'}" oninput="updateIngredient(${ing.id}, 'unit', this.value)"
                        placeholder="Unit" class="w-16 text-center rounded-lg border-gray-300 shadow-sm p-2 border">
            </div>
            
            <div class="flex-none w-24 flex flex-col justify-center items-center bg-gray-50 border rounded-lg hover:border-indigo-500 cursor-pointer p-1 relative" 
                    onclick="document.getElementById('file-input-${ing.id}').click()">
                ${imagePreview}
                <input type="file" id="file-input-${ing.id}" 
                        onchange="handleImageUpload(event, ${ing.id})" 
                        accept="image/png, image/jpeg" class="absolute inset-0 opacity-0 cursor-pointer">
            </div>

            <button type="button" onclick="removeIngredient(${ing.id})" 
                    class="flex-none text-red-500 hover:text-red-700 p-2 self-center rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            </button>
        `;
        container.appendChild(div);
    });
    
    // --- RESTORED: Default behavior where button is always enabled ---
    const addBtn = document.getElementById('addIngredientBtn');
    addBtn.disabled = false;
    addBtn.className = 'mt-3 w-full bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition duration-150 shadow-md';
    addBtn.onclick = window.addIngredient; 
    addBtn.textContent = '+ Add Ingredient';
    // --- END RESTORED ---
}

/**
 * Generates the common inner HTML content for the main meal label.
 * The preparedFor and cookOn values are now static placeholders.
 */
function generateMainLabelContent(productName, mealName, ingredientsHTML, dietaryInfo, handlingInstructions) {
    
    // --- MODIFICATION: Removed date calculation. Date lines will be blank. ---
    const emptyDate = ''; 
    
    // Static text for sticker placeholders
    const STICKER_PLACEHOLDER = 'STICKER HERE';
    
    // Reusable class for left-aligned content section
    const contentClass = "flex items-start mb-3";
    // Reusable class for label column (fixed width)
    const labelColClass = "w-32 text-sm font-medium text-gray-800 flex-none";
    // Reusable class for value column (takes remaining space)
    const valueColClass = "text-sm flex-grow";
    
    return `
        <div class="text-xl font-bold text-gray-900">${productName}</div>
        <div class="label-line mt-1"></div>
        
        <div class="flex justify-between items-center mb-4">
            <div class="flex items-center text-sm font-medium">
                Prepared for
                <div class="sticker-box ml-2 text-center text-xs font-bold uppercase text-gray-700">${STICKER_PLACEHOLDER}</div>
            </div>
            <div class="flex items-center text-sm font-medium">
                Cook on
                <div class="sticker-box ml-2 text-center text-xs font-bold uppercase text-gray-700">${STICKER_PLACEHOLDER}</div>
            </div>
        </div>
        <div class="label-line"></div>

        <div class="${contentClass}">
            <span class="${labelColClass}">Meal Name</span>
            <span class="${valueColClass} font-bold">${mealName}</span>
        </div>

        <div class="mb-2">
            <div class="${contentClass} mb-0">
                <span class="${labelColClass}">Ingredients</span>
                <div class="${valueColClass}"> 
                    <div class="mt-2 pl-4">
                        ${ingredientsHTML}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="${contentClass} mt-3">
            <span class="${labelColClass}">Dietary Info</span>
            <span class="${valueColClass} font-bold text-indigo-700">${dietaryInfo || '-'}</span>
        </div>

        <div class="${contentClass} mb-4">
            <span class="${labelColClass}">Handling Instructions</span>
            <span class="${valueColClass}">${handlingInstructions}</span>
        </div>
        <div class="label-line"></div>
        
        <div class="mb-2 text-sm">
            <span class="font-medium text-gray-800">Prepared At</span>
            <span class="ml-4 text-gray-700 font-medium">The Charles River Center, 59 E Militia Heights Dr, Needham, MA 02492</span>
        </div>
        <div class="flex items-center text-sm">
            <span class="font-medium text-gray-800">Prepared On</span>
            <span class="ml-4 text-gray-700">
                <span class="date-line">${emptyDate}</span> / 
                <span class="date-line">${emptyDate}</span> / 
                <span class="date-line">${emptyDate}</span>
            </span>
        </div>
    `;
}

window.updateLabel = function() {
    // --- 1. FETCH INPUTS ---
    const productName = document.getElementById('productName').value || 'Product Name';
    const mealName = document.getElementById('mealName').value || 'Insert Meal Name';
    const dietaryInfo = document.querySelector('input[name="dietaryInfo"]:checked').value;
    const handlingInstructions = document.getElementById('handlingInstructions').value || 'Insert handling instructions';

    // --- 2. PROCESS INGREDIENTS & GENERATE PARTS ---
    const activeIngredients = ingredients.filter(ing => ing.name.trim());
    
    // Generate the list of ingredients for the main label
    const ingredientsHTML = activeIngredients.map(ing => {
        const ozDisplay = `
            <div class="flex-none flex items-center w-20 text-sm font-medium text-gray-800">
                <span class="oz-line w-10"></span>
                <span class="ml-2">${ing.unit}</span>
            </div>
        `;
        const nameDisplay = ing.name.trim(); 

        return `
            <div class="flex items-start mb-1">
                ${ozDisplay}
                <span class="flex-grow text-sm">${nameDisplay}</span>
            </div>
        `;
    }).join('');

    const mainLabelContent = generateMainLabelContent(
        productName, mealName, ingredientsHTML, dietaryInfo, handlingInstructions
    );

    // --- NEW LOGIC: Generate fixed 5-slot structure ---
    let nutritionImagesHTML = '';
    const maxSlots = 5;

    for (let i = 0; i < maxSlots; i++) {
        const ing = ingredients[i];
        const index = i; // 0-based index for iteration
        const nameDisplay = 'Ingredient ' + (index + 1);

        // Check if a valid ingredient exists AND has an image
        if (ing && ing.nutritionImage) {
            // Slot is filled with the image (uses standard .nutrition-image-container)
            nutritionImagesHTML += `
                <div class="nutrition-image-container flex-none text-center bg-gray-50">
                    <h3 class="text-[10px] font-semibold mb-1 truncate text-gray-800 px-1 pt-1">${nameDisplay}</h3>
                    <img src="${ing.nutritionImage}" 
                        alt="${nameDisplay}" class="h-auto">
                </div>
            `;
        } else {
            // Slot is empty - ADD THE .nutrition-slot-empty CLASS TO BE HIDDEN DURING PRINT
            nutritionImagesHTML += `
                <div class="nutrition-image-container nutrition-slot-empty flex-none text-center flex">
                    <span class="text-xs text-gray-500 m-auto">${nameDisplay} Slot Empty</span>
                </div>
            `;
        }
    }
    // --- END NEW LOGIC ---

    // --- 3. DETERMINE LAYOUT (Fixed Stacked Layout) ---
    let finalLabelHTML = '';
    
    // On-screen preview always uses the 5-column grid class
    const gridColsClass = 'grid-cols-5-print';

    // Always show the stacked layout with the 5 slots
    finalLabelHTML = `
        <div class="print-stacked-layout w-full h-full">
            <div class="meal-label-box p-4 bg-white shadow-2xl mb-6 w-full">
                ${mainLabelContent}
            </div>

            <div id="nutrition-labels-section" class="pt-0 w-full mt-4">
                <div id="nutrition-images-grid" class="grid ${gridColsClass} gap-4">
                    ${nutritionImagesHTML}
                </div>
            </div>
        </div>
    `;

    document.getElementById('label-preview').innerHTML = finalLabelHTML;
}

// Initialize inputs and label preview
window.onload = function() {
    renderIngredientInputs();
    updateLabel();
    // Attach input event listeners for real-time updates
    const formElements = document.querySelectorAll('#labelForm input[type="text"], #labelForm textarea');
    formElements.forEach(el => el.addEventListener('input', updateLabel));
}
