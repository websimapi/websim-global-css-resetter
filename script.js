const RESET_CSS_ID = 'global-css-override-reset';

// The aggressive CSS reset string.
// `all: unset` reverts all properties to their initial or inherited state.
// We add `display: block` because `unset` makes block elements like <div>
// render as `inline`, which is usually not desired for a visual reset.
// `!important` is used to ensure these styles override any existing styles.
const RESET_STYLE_CONTENT = `
* {
    all: unset !important;
    display: block !important;
}
body, html {
    display: block !important;
}
`;

/**
 * Injects the reset CSS into a given document's <head>.
 * It will remove any previously injected reset style with the same ID.
 * @param {Document} doc The document object to inject the style into.
 */
function applyReset(doc) {
    if (!doc) return;
    try {
        const existingStyle = doc.getElementById(RESET_CSS_ID);
        if (existingStyle) {
            existingStyle.remove();
        }

        const style = doc.createElement('style');
        style.id = RESET_CSS_ID;
        style.textContent = RESET_STYLE_CONTENT;
        doc.head.appendChild(style);
    } catch (e) {
        // This can happen with cross-origin iframes.
        console.warn('Could not apply CSS reset to a document. This is likely due to cross-origin restrictions.', e.message);
    }
}

/**
 * Initiates a global CSS reset, starting from the top-most window
 * and traversing down through all child iframes.
 */
function performGlobalReset() {
    // Start with the top-most window in the hierarchy.
    const topWin = window.top;

    // A recursive function to walk through all frames.
    function walkFrames(win) {
        // Apply reset to the current window's document.
        // We need to wrap this in a try-catch because accessing win.document
        // on a cross-origin frame will throw a security error.
        try {
            applyReset(win.document);

            // Recursively call for all frames within this window.
            // Accessing win.frames is also subject to cross-origin restrictions.
            for (let i = 0; i < win.frames.length; i++) {
                walkFrames(win.frames[i]);
            }
        } catch (e) {
            console.warn('Could not access a frame. This is likely due to cross-origin restrictions.', e.message);
        }
    }

    walkFrames(topWin);
}


// Main execution
document.addEventListener('DOMContentLoaded', () => {
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', performGlobalReset);
    } else {
        console.error('Reset button not found.');
    }
});