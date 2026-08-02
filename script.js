document.addEventListener("DOMContentLoaded", function () {
    // ==========================================
    // 1. EFFET D'APPARITION AU SCROLL
    // ==========================================
    function appearOnScroll() {
        const sections = document.querySelectorAll("section, .container");
        const windowBottom = window.innerHeight + window.scrollY;

        sections.forEach(sec => {
            if (!sec.dataset.animated) {
                sec.style.opacity = "0";
                sec.style.transform = "translateY(30px)";
                sec.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out";
                sec.dataset.animated = "true";
            }

            if (windowBottom > sec.offsetTop + 50) {
                sec.style.opacity = "1";
                sec.style.transform = "translateY(0)";
            }
        });
    }

    window.addEventListener("scroll", appearOnScroll);

    // ==========================================
    // 2. MENU MOBILE
    // ==========================================
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", function () {
            const isOpen = navLinks.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", isOpen.toString());
        });

        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    // ==========================================
    // 3. GESTION ET FILTRAGE DES PRODUITS
    // ==========================================
    const fallbackProducts = [
        {
            img: "assets/img/Tensiomètre manuel.jpg",
            nom: "Tensiomètre Manuel",
            categorie: "Matériel Médical",
            description: "Appareil manuel pour mesurer la pression artérielle avec précision.",
            prix: "49,99 €"
        },
        {
            img: "assets/img/Tensiomètre manuel.jpg",
            nom: "Tensiomètre Electronique",
            categorie: "Matériel Médical",
            description: "Mesure automatique de la tension artérielle en quelques secondes.",
            prix: "79,99 €"
        },
        {
            img: "assets/img/OxymètreSaturometre.jpg",
            nom: "Oxymètre",
            categorie: "Matériel Médical",
            description: "Mesure la saturation en oxygène du sang et le pouls.",
            prix: "34,50 €"
        },
        {
            img: "assets/img/Penlight rechargeable.jpg",
            nom: "Penlight Médical",
            categorie: "Accessoires Médicaux",
            description: "Lampe compacte pour les examens médicaux de précision.",
            prix: "12,00 €"
        },
        {
            img: "assets/img/Otoscope.jpg",
            nom: "Stéthoscope Double Foyer",
            categorie: "Accessoires Médicaux",
            description: "Instrument professionnel pour écouter les sons du cœur et des poumons.",
            prix: "89,90 €"
        },
        {
            img: "assets/img/Glucometre complet.jpg",
            nom: "Glucomètre Complet",
            categorie: "Équipements Médicaux",
            description: "Kit complet pour mesurer la glycémie avec résultats rapides.",
            prix: "69,90 €"
        },
        {
            img: "assets/img/Surblouse.jpg",
            nom: "Blouse Manche Longue",
            categorie: "Vêtements Professionnels",
            description: "Blouse médicale confortable et résistante pour usage quotidien.",
            prix: "39,99 €"
        },
        {
            img: "assets/img/Surblouse1.jpg",
            nom: "Blouse Manche Courte",
            categorie: "Vêtements Professionnels",
            description: "Blouse légère idéale pour le travail en environnement médical.",
            prix: "35,99 €"
        },
        {
            img: "assets/img/Bonnet jetable.jpg",
            nom: "Lunettes Anti-Bleu",
            categorie: "Accessoires Médicaux",
            description: "Protection des yeux contre la lumière bleue et la fatigue visuelle.",
            prix: "24,50 €"
        },
        {
            img: "assets/img/Bottine infirmière.jpeg",
            nom: "Bottines Infirmières",
            categorie: "Vêtements Professionnels",
            description: "Chaussures de travail confortables et antidérapantes.",
            prix: "59,90 €"
        },
        {
            img: "assets/img/Thermomètre à mercure.jpg",
            nom: "Thermomètre Digital",
            categorie: "Consommables Médicaux",
            description: "Thermomètre rapide et précis pour usage quotidien.",
            prix: "15,90 €"
        },
        {
            img: "assets/img/Bonnet jetable.jpg",
            nom: "Masque Chirurgical",
            categorie: "Consommables Médicaux",
            description: "Lot de masques pour la protection en milieu médical.",
            prix: "9,99 €"
        }
    ];

    function loadProducts() {
        const container = document.querySelector("#products-container");
        if (!container) return;

        const categories = [...new Set(fallbackProducts.map(p => p.categorie))];
        setupFilters(categories, fallbackProducts);
        displayProducts(fallbackProducts, "all");
    }

    function setupFilters(categories, products) {
        const filterBtnContainer = document.querySelector("#filter-buttons");
        if (!filterBtnContainer) return;

        filterBtnContainer.innerHTML = '<button class="filter-btn active" data-category="all">Tous les produits</button>';

        categories.forEach(category => {
            const btn = document.createElement("button");
            btn.className = "filter-btn";
            btn.setAttribute("data-category", category);
            btn.textContent = category;
            filterBtnContainer.appendChild(btn);
        });

        const filterButtons = filterBtnContainer.querySelectorAll(".filter-btn");
        filterButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                filterButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                const selectedCategory = btn.getAttribute("data-category");
                displayProducts(products, selectedCategory);
            });
        });
    }

    function displayProducts(products, selectedCategory = "all") {
        const container = document.querySelector("#products-container");
        if (!container) return;

        const filteredProducts = selectedCategory === "all"
            ? products
            : products.filter(p => p.categorie === selectedCategory);

        if (filteredProducts.length === 0) {
            container.innerHTML = "<p class='no-results'>Aucun produit ne correspond à ce filtre.</p>";
            return;
        }

        const categories = [...new Set(filteredProducts.map(p => p.categorie))];

        container.innerHTML = categories.map(category => {
            const cards = filteredProducts
                .filter(p => p.categorie === category)
                .map(p => `
                    <article class="card">
                        <img src="${p.img}" alt="${p.nom}" loading="lazy">
                        <div class="product-meta">
                            <span class="category">${p.categorie}</span>
                            <h3>${p.nom}</h3>
                            <p>${p.description}</p>
                            <span class="price">${p.prix}</span>
                        </div>
                    </article>
                `).join("");

            return `
                <section class="product-section">
                    <h2>${category}</h2>
                    <div class="products">${cards}</div>
                </section>
            `;
        }).join("");

        appearOnScroll();
    }

    loadProducts();

    // ==========================================
    // 4. VALIDATION DE FORMULAIRE
    // ==========================================
    const form = document.querySelector("form");
    if (form) {
        const inputs = form.querySelectorAll("input, textarea");

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            let valide = true;

            inputs.forEach(input => input.style.borderColor = "#cbd5e0");

            const nom = form.querySelector("input[type='text']");
            const email = form.querySelector("input[type='email']");
            const message = form.querySelector("textarea");

            if (nom && nom.value.trim() === "") {
                nom.style.borderColor = "red";
                valide = false;
            }
            if (email && (email.value.trim() === "" || !email.value.includes("@"))) {
                email.style.borderColor = "red";
                valide = false;
            }
            if (message && message.value.trim() === "") {
                message.style.borderColor = "red";
                valide = false;
            }

            if (!valide) {
                alert("Veuillez remplir correctement tous les champs !");
                return;
            }

            alert("Message envoyé !");
            form.reset();
        });

        inputs.forEach(input => {
            input.addEventListener("focus", () => input.style.borderColor = "var(--accent)");
            input.addEventListener("blur", () => input.style.borderColor = "#cbd5e0");
        });
    }

    // ==========================================
    // 5. BOUTON RETOUR EN HAUT
    // ==========================================
    const btnTop = document.createElement("button");
    btnTop.className = "back-to-top";
    btnTop.setAttribute("aria-label", "Remonter en haut");
    btnTop.innerHTML = "↑";
    document.body.appendChild(btnTop);

    window.addEventListener("scroll", () => {
        btnTop.classList.toggle("show", window.scrollY > 200);
    });

    btnTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Initialisation
    appearOnScroll();
});
