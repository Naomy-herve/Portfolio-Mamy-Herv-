/* =====================================================
   JAVASCRIPT - PORTFOLIO
   ===================================================== */

// ==================== INITIALISATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initializeNavigation();
    initializeTheme();
    initializeFormValidation();
    initializeFilters();
    initializeSlider();
    initializeScrollAnimation();
    initializeStatCounters();
    initializeScrollTop();
    initializeProjectModal();
    initializeImageFallback();
    initializeAccessibility();
    initializeSystemThemeSync();
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});

// ==================== UTILITAIRES (déclarés en premier pour être réutilisés) ====================

// Debounce pour les événements fréquents
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Throttle pour les événements très fréquents
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

// Fonction pour compter les statistiques (utilisée par initializeStatCounters)
function animateCounter(element, targetNumber, suffix = '') {
    let current = 0;
    const duration = 1500;
    const steps = 40;
    const increment = targetNumber / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
        current += increment;
        if (current >= targetNumber) {
            element.textContent = targetNumber + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, stepTime);
}

// Fonction pour les notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}

// ==================== BARRE DE PROGRESSION DE SCROLL ====================
function initScrollProgress() {
    const scrollProgress = document.querySelector('.scroll-progress');
    if (!scrollProgress) return;

    const updateProgress = () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = scrolled + '%';
    };

    window.addEventListener('scroll', throttle(updateProgress, 50));
    updateProgress();
}

// ==================== 1. NAVIGATION & HAMBURGER ====================
function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    const toggleMenu = () => {
        const isActive = hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isActive);
    };

    // Toggle menu hamburger (clic + clavier)
    hamburger.addEventListener('click', toggleMenu);
    hamburger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });

    // Fermer le menu au clic sur un lien
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            updateActiveLink(link);
        });
    });

    // Ombre de la navbar + lien actif au scroll (throttlé pour la performance)
    window.addEventListener('scroll', throttle(() => {
        // Ombre au scroll
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Mettre à jour le lien actif
        let current = '';
        const sections = document.querySelectorAll('section');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;

            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, 100));
}

function updateActiveLink(link) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
}

// ==================== 2. THÈME SOMBRE ====================
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    // Appliquer le thème sauvegardé
    if (isDarkMode) {
        document.body.classList.add('dark-theme');
        updateThemeIcon(true);
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('darkMode', isDark);
        updateThemeIcon(isDark);
    });
}

function updateThemeIcon(isDarkMode) {
    const themeToggle = document.getElementById('themeToggle');
    if (isDarkMode) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggle.setAttribute('aria-label', 'Activer le thème clair');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.setAttribute('aria-label', 'Activer le thème sombre');
    }
}

// Synchronisation avec la préférence système (uniquement si l'utilisateur n'a pas fait de choix explicite)
function initializeSystemThemeSync() {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

    const applySystemPreference = (matches) => {
        if (localStorage.getItem('darkMode') === null) {
            document.body.classList.toggle('dark-theme', matches);
            updateThemeIcon(matches);
        }
    };

    // API moderne (addListener est obsolète)
    prefersDarkMode.addEventListener('change', (e) => applySystemPreference(e.matches));

    applySystemPreference(prefersDarkMode.matches);
}

// ==================== 3. VALIDATION FORMULAIRE ====================
function initializeFormValidation() {
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        const submitBtn = contactForm.querySelector('button[type="submit"]');

        // Validation
        if (!name || !email || !subject || !message) {
            showFormMessage('Veuillez remplir tous les champs!', 'error');
            return;
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showFormMessage('Veuillez entrer une adresse email valide!', 'error');
            return;
        }

        // Simulation d'envoi
        showFormMessage('Envoi en cours...', 'info');
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';

        setTimeout(() => {
            showFormMessage('Message envoyé avec succès! Merci de nous avoir contactés.', 'success');
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';

            // Réinitialiser le message après 5 secondes
            setTimeout(() => {
                const formMessage = document.getElementById('formMessage');
                formMessage.style.display = 'none';
            }, 5000);
        }, 1500);
    });
}

function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
}

// ==================== 4. FILTRAGE DES PROJETS ====================
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Mettre à jour le bouton actif
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            // Filtrer les projets
            projectCards.forEach(card => {
                card.style.animation = 'none';
                setTimeout(() => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeInUp 0.6s ease';
                    } else {
                        card.style.display = 'none';
                    }
                }, 50);
            });
        });
    });
}

// ==================== 5. CARROUSEL TÉMOIGNAGES ====================
function initializeSlider() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('sliderDots');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    let currentSlide = 0;
    let autoplayTimer = null;

    if (!testimonialCards.length) return;

    // Générer les pastilles (dots) dynamiquement
    testimonialCards.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot';
        dot.setAttribute('aria-label', `Témoignage ${index + 1}`);
        dot.addEventListener('click', () => {
            showSlide(index);
            resetAutoplay();
        });
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.slider-dot');

    function showSlide(index) {
        if (index >= testimonialCards.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = testimonialCards.length - 1;
        } else {
            currentSlide = index;
        }

        testimonialCards.forEach(card => card.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        testimonialCards[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function resetAutoplay() {
        clearInterval(autoplayTimer);
        autoplayTimer = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 6000);
    }

    // Afficher la première slide au chargement
    showSlide(0);
    resetAutoplay();

    prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
        resetAutoplay();
    });

    nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
        resetAutoplay();
    });

    // Navigation au clavier (uniquement quand le carrousel est visible à l'écran)
    document.addEventListener('keydown', (e) => {
        const sliderSection = document.getElementById('testimonials');
        if (!sliderSection) return;
        const rect = sliderSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (!isVisible) return;

        if (e.key === 'ArrowLeft') {
            showSlide(currentSlide - 1);
            resetAutoplay();
        } else if (e.key === 'ArrowRight') {
            showSlide(currentSlide + 1);
            resetAutoplay();
        }
    });

    // Pause de l'autoplay au survol
    const sliderWrapper = document.querySelector('.testimonials-slider');
    sliderWrapper.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    sliderWrapper.addEventListener('mouseleave', resetAutoplay);
}

// ==================== 6. ANIMATIONS AU SCROLL ====================
function initializeScrollAnimation() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observer les éléments à animer
    const elementsToAnimate = document.querySelectorAll(
        '.about-text, .stat, .skill-category, .project-card, .timeline-item, .contact-info'
    );

    elementsToAnimate.forEach(element => {
        element.style.opacity = '0';
        observer.observe(element);
    });

    // Préparer et animer les barres de compétences
    const skillBars = document.querySelectorAll('.skill-progress');

    // Mémoriser la largeur cible réelle avant de tout remettre à zéro
    skillBars.forEach(bar => {
        const targetWidth = bar.getAttribute('data-width') || bar.style.width || '0%';
        bar.setAttribute('data-width', targetWidth);
        bar.style.width = '0';
    });

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // On lit toujours la largeur cible depuis data-width (jamais depuis style.width,
                // qui vaut '0' à ce stade et empêcherait l'animation de fonctionner)
                const targetWidth = entry.target.getAttribute('data-width') || '0%';
                requestAnimationFrame(() => {
                    entry.target.style.width = targetWidth;
                });
                skillObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    skillBars.forEach(bar => skillObserver.observe(bar));
}

// ==================== 7. COMPTEURS DE STATISTIQUES ====================
function initializeStatCounters() {
    const statNumbers = document.querySelectorAll('.stat h4[data-target]');
    if (!statNumbers.length) return;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'), 10);
                const suffix = entry.target.getAttribute('data-suffix') || '';
                animateCounter(entry.target, target, suffix);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => counterObserver.observe(stat));
}

// ==================== 8. GESTION DES IMAGES ====================
function initializeImageFallback() {
    // Repli en SVG si l'image de profil est introuvable
    document.querySelectorAll('img.profile-img').forEach(img => {
        img.addEventListener('error', () => {
            const svg = 'data:image/svg+xml;utf8,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-family="Poppins, sans-serif" font-size="20">Image indisponible</text></svg>'
            );
            img.src = svg;
        }, { once: true });
    });

    // Lazy loading des images utilisant data-src
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
    }
}

// ==================== 9. BOUTON RETOUR EN HAUT ====================
function initializeScrollTop() {
    const scrollTopBtn = document.getElementById('scrollTop');

    window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > 300) {
            scrollTopBtn.style.display = 'flex';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    }, 150));

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ==================== 10. MODALE DE PROJET ====================
function initializeProjectModal() {
    const modal = document.getElementById('projectModal');
    const overlay = document.getElementById('projectModalOverlay');
    const closeBtn = document.getElementById('projectModalClose');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalTags = document.getElementById('modalTags');

    if (!modal) return;

    function openModal(card) {
        const icon = card.querySelector('.project-image i');
        const title = card.querySelector('.project-content h3');
        const description = card.querySelector('.project-content p');
        const tags = card.querySelectorAll('.tag');

        modalIcon.innerHTML = icon ? icon.outerHTML : '';
        modalTitle.textContent = title ? title.textContent : '';
        modalDescription.textContent = description ? description.textContent : '';

        modalTags.innerHTML = '';
        tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = tag.textContent;
            modalTags.appendChild(span);
        });

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-btn');
        if (btn) {
            e.preventDefault();
            const card = btn.closest('.project-card');
            if (card) openModal(card);
        }
    });

    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// ==================== 11. ACCESSIBILITÉ ====================
function initializeAccessibility() {
    // Gestion du focus au clavier
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Fermer les menus/modales ouvertes
            document.getElementById('navMenu').classList.remove('active');
            document.getElementById('hamburger').classList.remove('active');
        }

        // Navigation au clavier (Tab)
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
    });
}

// ==================== 12. EFFET PARALLAX ====================
window.addEventListener('scroll', throttle(() => {
    const scrollPosition = window.scrollY;
    const parallaxElements = document.querySelectorAll('.parallax');

    parallaxElements.forEach(element => {
        element.style.backgroundPosition = `center ${scrollPosition * 0.5}px`;
    });
}, 16));
