document.addEventListener("click", async (event) => {
    const button = event.target.closest(".copy-button");

    if (!button) {
        return;
    }

    const codeBlock = button.closest(".code-block");
    const code = codeBlock.querySelector("code");

    try {
        await navigator.clipboard.writeText(code.textContent);

        button.classList.add("copied");
        button.setAttribute("aria-label", "Copied!");

        setTimeout(() => {
            button.classList.remove("copied");
            button.setAttribute("aria-label", "Copy code");
        }, 1500);

    } catch (error) {
        console.error("Failed to copy code:", error);
    }
});