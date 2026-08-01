/**
 * ============================================================================
 * MEDICAL STORE PLATFORM - CORE SCRIPT (PRO 2.0)
 * Architecture moderne orientée objet, optimisée pour la performance et l'accessibilité.
 * ============================================================================
 */

class MedicalStoreApp {
    /**
     * URL source des données de produits.
     * @type {string}
     */
    static PRODUCTS_JSON_URL = "data/produits.json";

    /**
     * Produits de repli intégrés pour assurer un affichage même en cas de panne d'API/JSON.
     * @type {Array<Object>}
     */
    static FALLBACK_PRODUCTS = [
        { img: "assets/img/Tensiomètre manuel.jpg", nom: "Tensiomètre Manuel", categorie: "Matériel Médical", description: "Appareil manuel pour mesurer la pression artérielle avec précision.", prix: "49,99 €" },
        { img: "assets/img/Tensiomètre electronique.jpg", nom: "Tensiomètre Electronique", categorie: "Matériel Médical", description: "Mesure automatique de la tension artérielle en quelques secondes.", prix: "79,99 €" },
        { img: "assets/img/OxymètreSaturometre.jpg", nom: "Oxymètre", categorie: "Matériel Médical", description: "Mesure la saturation en oxygène du sang et le pouls.", prix: "34,50 €" },
        { img: "assets/img/Penlight rechargeable.jpg", nom: "Penlight Médical", categorie: "Accessoires Médicaux", description: "Lampe compacte pour les examens médicaux de précision.", prix: "12,00 €" },
        { img: "assets/img/Stéthoscope.jpg", nom: "Stéthoscope Double Foyer", categorie: "Accessoires Médicaux", description: "Instrument professionnel pour écouter les sons du cœur et des poumons.", prix: "89,90 €" },
        { img: "assets/img/Glucometre complet.jpg", nom: "Glucomètre Complet", categorie: "Équipements Médicaux", description: "Kit complet pour mesurer la glycémie avec résultats rapides.", prix: "69,90 €" },
        { img: "assets/img/Surblouse.jpg", nom: "Blouse Manche Longue", categorie: "Vêtements Professionnels", description: "Blouse médicale confortable et résistante pour usage quotidien.", prix: "39,99 €" },
        { img: "assets/img/Surblouse1.jpg", nom: "Blouse Manche Courte", categorie: "Vêtements Professionnels", description: "Blouse légère idéale pour le travail en environnement médical.", prix: "35,99 €" },
        { img: "assets/img/Bonnet jetable.jpg", nom: "Lunettes Anti-Bleu", categorie: "Accessoires Médicaux", description: "Protection des yeux contre la lumière bleue et la fatigue visuelle.", prix: "24,50 €" },
        { img: "assets/img/Bottine infirmière.jpeg", nom: "Bottines Infirmières", categorie: "Vêtements Professionnels", description: "Chaussures de travail confortables et antidérapantes.", prix: "59,90 €" },
        { img: "assets/img/Thermomètre digital.jpg", nom: "Thermomètre Digital", categorie: "Consommables Médicaux", description: "Thermomètre rapide et précis pour usage quotidien.", prix: "15,90 €" },
        { img: "assets/img/Masque chirurgical.jpg", nom: "Masque Chirurgical", categorie: "Consommables Médicaux", description: "Lot de masques pour la protection en milieu médical.", prix: "9,99 €" }
    ];

    constructor() {
        this.products = [];
        this.activeCategory = "all";

        // Éléments DOM fréquemment accédés
        this.dom = {
            productsContainer: document.querySelector("#products-container"),
            filterBtnContainer: document.querySelector("#filter-buttons"),
            navToggle: document.querySelector(".nav-toggle"),
            navLinks: document.querySelector(".nav-links"),
            form: document.querySelector("form")
        };

        this.init();
    }

    /**
     * Point d'entrée initialisant l'ensemble des sous-systèmes.
     */
    async init() {
        this.initScrollObserver();
        this.initMobileMenu();
        this.initBackToTop();
        this.initFormValidation();

        if (this.dom.productsContainer) {
            await this.loadProducts();
        }
    }

    // ==========================================
    // UTILS : Performance & Utilities
    // ==========================================

    /**
     * Utilitaire de Debounce pour réduire la fréquence d'exécution lors d'événements à fort débit.
     * @param {Function} fn - Fonction à exécuter
     * @param {number} delay - Délai en millisecondes
     */
    static debounce(fn, delay = 60) {
        let timer = null;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // ==========================================
    // ANIMATIONS AU SCROLL (IntersectionObserver Pro)
    // ==========================================

    /**
     * Remplace le calcul lourd sur window.scroll par l'API native IntersectionObserver.
     * Optimisé pour conserver 60 FPS lors du défilement.
     */
    initScrollObserver() {
        const targets = document.querySelectorAll("section, .container");
        if (!targets.length) return;

        const observerOptions = {
            root: null,
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    obs.unobserve(entry.target); // Libère la mémoire
                }
            });
        }, observerOptions);

        targets.forEach(target => {
            target.classList.add("reveal-on-scroll");
            observer.observe(target);
        });
    }

    // ==========================================
    // NAVIGATION ET MENU MOBILE
    // ==========================================

    initMobileMenu() {
        const { navToggle, navLinks } = this.dom;
        if (!navToggle || !navLinks) return;

        navToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", isOpen.toString());
        });

        // Fermeture automatique lors du clic sur un lien de navigation
        navLinks.addEventListener("click", (e) => {
            if (e.target.tagName === "A") {
                navLinks.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    // ==========================================
    // GESTION DU CATALOGUE PRODUITS
    // ==========================================

    /**
     * Charge les données dynamiques via Fetch API avec repli gracieux (Graceful Degradation).
     */
    async loadProducts() {
        try {
            const response = await fetch(MedicalStoreApp.PRODUCTS_JSON_URL);
            if (!response.ok) throw new Error(`Erreur réseau HTTP (${response.status})`);

            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) throw new Error("JSON invalide ou vide");

            this.products = data;
            this.renderCatalog(false);
        } catch (error) {
            console.warn("Échec du chargement des produits distants. Utilisation des données locales.", error);
            this.products = MedicalStoreApp.FALLBACK_PRODUCTS;
            this.renderCatalog(true);
        }
    }

    /**
     * Orchestre la mise en place des filtres et l'affichage initial.
     * @param {boolean} isFallback - Indique si les données proviennent du secours local.
     */
    renderCatalog(isFallback = false) {
        const categories = [...new Set(this.products.map(p => p.categorie))];

        this.setupFilterButtons(categories);
        this.displayProducts(isFallback);
    }

    /**
     * Génère les boutons de filtre dynamiquement et gère l'état actif.
     * @param {Array<string>} categories
     */
    setupFilterButtons(categories) {
        const { filterBtnContainer } = this.dom;
        if (!filterBtnContainer) return;

        // Fragment DOM pour minimiser le reflow
        const fragment = document.createDocumentFragment();

        const allBtn = document.createElement("button");
        allBtn.className = "filter-btn active";
        allBtn.dataset.category = "all";
        allBtn.textContent = "Tous les produits";
        fragment.appendChild(allBtn);

        categories.forEach(category => {
            const btn = document.createElement("button");
            btn.className = "filter-btn";
            btn.dataset.category = category;
            btn.textContent = category;
            fragment.appendChild(btn);
        });

        filterBtnContainer.innerHTML = "";
        filterBtnContainer.appendChild(fragment);

        // Délégation d'événement sur le parent
        filterBtnContainer.addEventListener("click", (e) => {
            const targetBtn = e.target.closest(".filter-btn");
            if (!targetBtn) return;

            filterBtnContainer.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
            targetBtn.classList.add("active");

            this.activeCategory = targetBtn.dataset.category;
            this.displayProducts();
        });
    }

    /**
     * Rendu HTML du catalogue de produits.
     * @param {boolean} isFallback 
     */
    displayProducts(isFallback = false) {
        const { productsContainer } = this.dom;
        if (!productsContainer) return;

        const filteredProducts = this.activeCategory === "all"
            ? this.products
            : this.products.filter(p => p.categorie === this.activeCategory);

        if (filteredProducts.length === 0) {
            productsContainer.innerHTML = "<p class='no-results'>Aucun produit ne correspond à ce filtre.</p>";
            return;
        }

        const categories = [...new Set(filteredProducts.map(p => p.categorie))];

        const errorMessage = isFallback 
            ? "<p class='error-banner'>Mode hors ligne / Données locales affichées.</p>" 
            : "";

        const catalogHTML = categories.map(category => {
            const categoryCards = filteredProducts
                .filter(p => p.categorie === category)
                .map(p => this.createProductCardHTML(p))
                .join("");

            return `
                <section class="product-section">
                    <h2>${category}</h2>
                    <div class="products-grid">${categoryCards}</div>
                </section>
            `;
        }).join("");

        productsContainer.innerHTML = errorMessage + catalogHTML;
        
        // Réinitialise l'observation des nouveaux éléments générés
        this.initScrollObserver();
    }

    /**
     * Génère le template d'une carte produit.
     * @param {Object} product
     * @returns {string} HTML string
     */
    createProductCardHTML(product) {
        const { img, nom, categorie, description, prix } = product;
        return `
            <article class="card product-card">
                <div class="card-media">
                    <img src="${img}" alt="${nom}" loading="lazy">
                </div>
                <div class="product-meta">
                    <span class="category">${categorie}</span>
                    <h3>${nom}</h3>
                    <p class="description">${description}</p>
                    <p class="price">${prix}</p>
                </div>
            </article>
        `;
    }

    // ==========================================
    // FORMULAIRE ET VALIDATION
    // ==========================================

    initFormValidation() {
        const { form } = this.dom;
        if (!form) return;

        const inputs = form.querySelectorAll("input, textarea");

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            let isValid = true;

            const nomInput = form.querySelector("#nom") || form.querySelector("input[type='text']");
            const emailInput = form.querySelector("#email") || form.querySelector("input[type='email']");
            const messageInput = form.querySelector("#message") || form.querySelector("textarea");

            // Réinitialisation des styles d'erreur
            inputs.forEach(input => input.classList.remove("invalid"));

            if (nomInput && !nomInput.value.trim()) {
                this.markInvalid(nomInput);
                isValid = false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailInput && !emailRegex.test(emailInput.value.trim())) {
                this.markInvalid(emailInput);
                isValid = false;
            }

            if (messageInput && !messageInput.value.trim()) {
                this.markInvalid(messageInput);
                isValid = false;
            }

            if (!isValid) {
                alert("Veuillez remplir correctement tous les champs requis !");
                return;
            }

            alert("Votre message a été envoyé avec succès !");
            form.reset();
        });
    }

    markInvalid(inputElement) {
        inputElement.classList.add("invalid");
    }

    // ==========================================
    // BOUTON HAUT DE PAGE (BACK TO TOP)
    // ==========================================

    initBackToTop() {
        const btnTop = document.createElement("button");
        btnTop.className = "back-to-top";
        btnTop.setAttribute("aria-label", "Remonter en haut de page");
        btnTop.innerHTML = "↑";
        document.body.appendChild(btnTop);

        const toggleVisibility = MedicalStoreApp.debounce(() => {
            btnTop.classList.toggle("show", window.scrollY > 300);
        }, 50);

        window.addEventListener("scroll", toggleVisibility);

        btnTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}

// Initialisation dès que le DOM est prêt
document.addEventListener("DOMContentLoaded", () => {
    new MedicalStoreApp();
});
