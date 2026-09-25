(() => {
    const storageKey = "moviehub-theme";
    let theme = "light";

    try {
        theme = localStorage.getItem(storageKey) === "dark" ? "dark" : "light";
    } catch {
        // Keep light mode as the fallback when storage is unavailable.
    }

    document.documentElement.dataset.theme = theme;

    document.addEventListener("DOMContentLoaded", () => {
        const toggle = document.querySelector(".theme-toggle");
        if (!toggle) return;

        const updateToggle = () => {
            const isDark = document.documentElement.dataset.theme === "dark";
            toggle.innerHTML = isDark ? "☀ <span>Light</span>" : "☾ <span>Dark</span>";
            toggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
            toggle.setAttribute("aria-pressed", String(isDark));
        };

        updateToggle();
        toggle.addEventListener("click", () => {
            const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
            document.documentElement.dataset.theme = nextTheme;
            try {
                localStorage.setItem(storageKey, nextTheme);
            } catch {
                // The selected theme still applies for this page session.
            }
            updateToggle();
        });
    });
})();
