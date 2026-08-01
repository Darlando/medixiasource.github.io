document.addEventListener("DOMContentLoaded", function () {

    // ===============================
    // OUTIL: DEBOUNCE (pou amelyore pèfòmans scroll)
    // ===============================
    function debounce(fn, delay = 60) {
        let timer = null;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // ===============================
    // EFFET D'APPARITION AU SCROLL
    // ===============================
    function appearOnScroll() {
        const sections = document.querySelectorAll("section, .container");
        const windowBottom = window.innerHeight + window.scrollY;

        sections.forEach(sec => {
            // Ne pas retoucher une section déjà révélée : évite le clignotement
            if (sec.dataset.revealed === "true") return;

            sec.style.opacity = 0;
            sec.style.transition = "opacity 1s ease-out, transform 1s ease-out";
            sec.style.transform = "translateY(30px)";

            if (windowBottom > sec.offsetTop + 50) {
                sec.style.opacity = 1;
                sec.style.transform = "translateY(0)";
                sec.dataset.revealed = "true";
            }
        });
    }

    window.addEventListener("scroll", debounce(appearOnScroll, 50));

    // ===============================
    // MENU MOBILE
    // ===============================
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

    // ===============================
    // CHARGEMENT DYNAMIQUE DES PRODUITS
    // ===============================
    const PRODUCTS_JSON_URL = "data/produits.json";

    const fallbackProducts = [
        {
            img: "assets/img/Tensiomètre manuel.jpg",
            nom: "Tensiomètre Manuel",
            categorie: "Matériel Médical",
            description: "Appareil manuel pour mesurer la pression artérielle avec précision.",
            prix: "49,99 €"
        },
        {
            img: "assets/img/Tensiomètre electronique.jpg",
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
            img: "assets/img/Stéthoscope.jpg",
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
            img: "assets/img/Thermomètre digital.jpg",
            nom: "Thermomètre Digital",
            categorie: "Consommables Médicaux",
            description: "Thermomètre rapide et précis pour usage quotidien.",
            prix: "15,90 €"
        },
        {
            img: "assets/img/Masque chirurgical.jpg",
            nom: "Masque Chirurgical",
            categorie: "Consommables Médicaux",
            description: "Lot de masques pour la protection en milieu médical.",
            prix: "9,99 €"
        }
    ];

    async function loadProducts() {
        const container = document.querySelector("#products-container");
        if (!container) return;

        try {
            const response = await fetch(PRODUCTS_JSON_URL);
            if (!response.ok) throw new Error("Réponse réseau invalide");

            const products = await response.json();
            if (!Array.isArray(products) || products.length === 0) {
                throw new Error("JSON vide ou invalide");
            }

            renderProducts(products, false);
        } catch (err) {
            // Le fichier JSON n'existe pas encore ou a échoué : on utilise le repli local
            renderProducts(fallbackProducts, true);
        }
    }

    function renderProducts(products, fallback = false) {
        const container = document.querySelector("#products-container");
        if (!container) return;

        container.innerHTML = fallback
            ? "<p class='error'>Impossible de charger le JSON, affichage depuis le repli local.</p>"
            : "";

        const categories = [...new Set(products.map(product => product.categorie))];

        setupFilters(categories, products);
        displayProducts(products, "all");

        animateCards();
        appearOnScroll();
    }

    function setupFilters(categories, products) {
        const filterBtnContainer = document.querySelector("#filter-buttons");
        if (!filterBtnContainer) return;

        // Réinitialiser les boutons (garder le bouton "Tous les produits")
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

        let filteredProducts = products;
        if (selectedCategory !== "all") {
            filteredProducts = products.filter(product => product.categorie === selectedCategory);
        }

        const categories = [...new Set(filteredProducts.map(product => product.categorie))];

        container.innerHTML = categories.map(category => {
            const cards = filteredProducts
                .filter(product => product.categorie === category)
                .map(product => `
                    <article class="card">
                        <img src="${product.img}" alt="${product.nom}">
                        <div class="product-meta">
                            <p class="category">${product.categorie}</p>
                            <h3>${product.nom}</h3>
                            <p>${product.description}</p>
                            <p class="price">${product.prix}</p>
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

        if (filteredProducts.length === 0) {
            container.innerHTML = "<p class='no-results'>Aucun produit ne correspond à ce filtre.</p>";
        }

        animateCards();
        appearOnScroll();
    }

    function animateCards() {
        const cards = document.querySelectorAll(".card");
        cards.forEach(card => {
            card.style.transition = "transform 0.3s, box-shadow 0.3s";
            card.addEventListener("mouseover", () => {
                card.style.transform = "scale(1.07)";
                card.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
            });
            card.addEventListener("mouseout", () => {
                card.style.transform = "scale(1)";
                card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            });
        });
    }

    loadProducts();

    // ===============================
    // FORMULAIRE
    // ===============================
    const form = document.querySelector("form");
    if (form) {
        const nomInput = form.querySelector("#nom") || form.querySelector("input[type='text']");
        const emailInput = form.querySelector("#email") || form.querySelector("input[type='email']");
        const messageInput = form.querySelector("#message") || form.querySelector("textarea");
        const inputs = form.querySelectorAll("input, textarea");

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            let valide = true;
            inputs.forEach(input => input.style.borderColor = "#ccc");

            const nom = nomInput ? nomInput.value.trim() : "";
            const email = emailInput ? emailInput.value.trim() : "";
            const message = messageInput ? messageInput.value.trim() : "";

            if (nom === "" && nomInput) {
                nomInput.style.borderColor = "red";
                valide = false;
            }
            if ((email === "" || !email.includes("@")) && emailInput) {
                emailInput.style.borderColor = "red";
                valide = false;
            }
            if (message === "" && messageInput) {
                messageInput.style.borderColor = "red";
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
            input.addEventListener("focus", () => input.style.borderColor = "#1aa36f");
            input.addEventListener("blur", () => input.style.borderColor = "#ccc");
        });
    }

    // ===============================
    // BOUTON HAUT DE PAGE
    // ===============================
    const btnTop = document.createElement("button");
    btnTop.className = "back-to-top";
    btnTop.setAttribute("aria-label", "Remonter en haut");
    btnTop.innerHTML = "↑";
    document.body.appendChild(btnTop);

    window.addEventListener("scroll", debounce(() => {
        btnTop.classList.toggle("show", window.scrollY > 200);
    }, 50));

    btnTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // ===============================
    // LIENS DU MENU - EFFET HOVER
    // ===============================
    const navLinksAnimated = document.querySelectorAll("nav a");
    navLinksAnimated.forEach(link => {
        link.style.transition = "color 0.3s, transform 0.2s";
        link.addEventListener("mouseover", () => link.style.transform = "scale(1.1)");
        link.addEventListener("mouseout", () => link.style.transform = "scale(1)");
    });

    appearOnScroll();
});
