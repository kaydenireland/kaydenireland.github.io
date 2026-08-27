async function loadComponent(id, file) {
    const element = document.getElementById(id);

    const response = await fetch(file);
    element.innerHTML = await response.text();
}

async function loadComponents() {
    await loadComponent("header-container", "components/header.html");
    await loadComponent("footer-container", "components/footer.html");
}

loadComponents();