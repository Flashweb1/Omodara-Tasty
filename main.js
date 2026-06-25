import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Import your CSS file here if using a module bundler (Vite, Webpack, etc.)
// import './styles.css';

const firebaseConfig = {
    apiKey: "AIzaSyDUxsu_bxWB4cFznjwvsV8BHLwf52uvJsE",
    authDomain: "omodara-tasty.firebaseapp.com",
    projectId: "omodara-tasty",
    storageBucket: "omodara-tasty.firebasestorage.app",
    messagingSenderId: "81896187252",
    appId: "1:81896187252:web:17ef6e725a92b557df7821",
    measurementId: "G-DWVYQSK236"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);

const PAYSTACK_PUBLIC_KEY = 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY_HERE';
const EMAILJS_CONFIG = {
    SERVICE_ID: 'YOUR_SERVICE_ID',
    TEMPLATE_ID: 'YOUR_TEMPLATE_ID',
    PUBLIC_KEY: 'REPLACE_WITH_YOUR_EMAILJS_PUBLIC_KEY'
};

const googleProvider = new GoogleAuthProvider();

const APP_CONFIG = {
    phone: "2349079490452",
    displayPhone: "+234 907 949 0452",
    oldPhoneToReplace: "+234 907 949 0452"
};

// Toast Notification System
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // Force reflow for CSS animation
    void toast.offsetWidth;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Smooth Page Transitions Interceptor
    document.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (link && link.href && link.href.startsWith(window.location.origin) && !link.hash && link.target !== '_blank' && !link.hasAttribute('download')) {
            e.preventDefault();
            document.body.classList.add('page-transitioning');
            setTimeout(() => { window.location.href = link.href; }, 350);
        }
    });

    document.querySelectorAll('a[href*="wa.me/"]').forEach(link => {
        if (link.textContent.toLowerCase().includes('order') || link.href.toLowerCase().includes('order')) {
            link.removeAttribute('href');
            link.removeAttribute('target');
            link.style.cursor = 'pointer';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showToast("Our ordering system has upgraded! Please use the 'Add to Cart' buttons to check out directly on the website.", 'info');
            });
        } else {
            link.href = link.href.replace(/wa\.me\/\d+/, `wa.me/${APP_CONFIG.phone}`);
        }
    });

    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.href = `tel:+${APP_CONFIG.phone}`;
    });

    // ===== Event Binding =====
    // Hero Slider Auto-Rotate with Touch Support
    let currentSlide = 0;
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');
    const totalSlides = slides.length;
    let autoRotateInterval;
    let touchStartX = 0;

    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach((dot, idx) => {
            dot.classList.remove('active');
            dot.setAttribute('aria-pressed', idx === n);
        });
        
        slides[n].classList.add('active');
        dots[n].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }

    function resetAutoRotate() {
        clearInterval(autoRotateInterval);
        // Using 6 seconds for a more relaxed, premium feel
        autoRotateInterval = setInterval(nextSlide, 6000);
    }

    // Auto-rotate every 5 seconds
    autoRotateInterval = setInterval(nextSlide, 6000);

    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
            resetAutoRotate();
        });

        // Keyboard support for accessibility
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
                resetAutoRotate();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
                resetAutoRotate();
            }
        });
    });

    // Touch swipe support for mobile
    const heroSlider = document.querySelector('.hero-slider');
    if (heroSlider) {
        heroSlider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, false);

        heroSlider.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
                resetAutoRotate();
            }
        }, false);

        // Pause auto-rotation on hover (desktop)
        heroSlider.addEventListener('mouseenter', () => {
            clearInterval(autoRotateInterval);
        });

        heroSlider.addEventListener('mouseleave', () => {
            resetAutoRotate();
        });
    }

    // Nav cart
    const navCart = document.getElementById('nav-cart');
    if (navCart) {
        navCart.addEventListener('click', (e) => { e.preventDefault(); toggleCart(); });
    }

    // Menu tab switching
    document.querySelectorAll('[data-menu]').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-menu');
            showMenu(category, btn);
        });
    });

    // Gallery filter
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterGallery(filter, btn);
        });
    });

    // Day tab switching
    document.querySelectorAll('[data-day]').forEach(btn => {
        btn.addEventListener('click', () => {
            const day = btn.getAttribute('data-day');
            showDay(day, btn);
        });
    });

    // FAQ toggle
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => toggleFaq(q));
        q.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFaq(q); }
        });
    });

    // Add to Cart buttons (data attributes)
    document.querySelectorAll('[data-add-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-add-id');
            const name = btn.getAttribute('data-add-name');
            const price = parseFloat(btn.getAttribute('data-add-price'));
            if (id && name && price) addToCart(id, name, price);
        });
    });

    // Variant Selection Event for Tiered Menu Items
    document.addEventListener('change', e => {
        if (e.target.classList.contains('variant-select')) {
            const card = e.target.closest('.menu-item');
            if (!card) return;
            const priceSpan = card.querySelector('.menu-item-price');
            const btn = card.querySelector('.menu-item-order');
            const opt = e.target.options[e.target.selectedIndex];
            
            if (priceSpan && btn && opt) {
                priceSpan.innerHTML = '&#8358;' + parseFloat(opt.value).toLocaleString();
                btn.setAttribute('data-add-price', opt.value);
                btn.setAttribute('data-add-name', opt.getAttribute('data-name'));
                const newId = btn.getAttribute('data-base-id') + '-' + opt.text.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                btn.setAttribute('data-add-id', newId);
            }
        }
    });

    // Checkout CTA
    const checkoutCta = document.getElementById('checkoutCta');
    if (checkoutCta) {
        checkoutCta.addEventListener('click', (e) => { e.preventDefault(); openCheckout(); });
    }

    // Newsletter form
    const newsletterSubmit = document.getElementById('newsletterSubmit');
    const newsletterEmail = document.getElementById('newsletterEmail');
    if (newsletterSubmit && newsletterEmail) {
        newsletterSubmit.addEventListener('click', async () => {
            const email = newsletterEmail.value.trim();
        if (!email) { showToast('Please enter your email address.', 'error'); return; }
            try {
                await addDoc(collection(db, "newsletter"), {
                    email,
                    subscribedAt: new Date().toISOString()
                });
            showToast('Thank you for subscribing!', 'success');
                newsletterEmail.value = '';
            } catch (error) {
                console.error('Newsletter error:', error);
            showToast('Subscription failed. Please try again later.', 'error');
            }
        });
        newsletterEmail.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') newsletterSubmit.click();
        });
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const name = document.getElementById('contactName')?.value || '';
            const email = document.getElementById('contactEmail')?.value || '';
            const phone = document.getElementById('contactPhone')?.value || '';
            const subject = document.getElementById('contactSubject')?.value || '';
            const message = document.getElementById('contactMessage')?.value || '';
            try {
                await addDoc(collection(db, "inquiries"), {
                    name, email, phone, subject, message,
                    createdAt: new Date().toISOString()
                });
            showToast('Thank you for your message! We will get back to you shortly.', 'success');
                contactForm.reset();
            } catch (error) {
                console.error('Contact form error:', error);
            showToast('Failed to send message. Please try again or reach us via WhatsApp.', 'error');
            }
        });
    }

    // Load third-party scripts
    const paystackScript = document.createElement('script');
    paystackScript.src = "https://js.paystack.co/v1/inline.js";
    document.head.appendChild(paystackScript);

    const emailJsScript = document.createElement('script');
    emailJsScript.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
    emailJsScript.onload = () => {
        if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY !== 'REPLACE_WITH_YOUR_EMAILJS_PUBLIC_KEY') {
            emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        } else {
            console.warn('EmailJS public key is not configured. Email features will remain disabled.');
        }
    };
    document.head.appendChild(emailJsScript);

    // Inject Cart Sidebar HTML
    const cartSidebar = document.createElement('div');
    cartSidebar.id = 'cartSidebar';
    cartSidebar.className = 'cart-sidebar';
    cartSidebar.style.transition = 'none'; // Prevent flash on page load
    cartSidebar.innerHTML = `
        <div class="cart-header">
            <h2>Your Order</h2>
            <button class="close-cart" id="closeCartBtn">&times;</button>
        </div>
        <div id="cartItems" class="cart-items"></div>
        <div class="cart-footer">
            <div class="cart-total-row">
                <span>Total:</span>
                <span id="cartTotal">&#8358;0</span>
            </div>
            <button class="checkout-btn" id="checkoutBtn">Proceed to Checkout</button>
        </div>
    `;
    document.body.appendChild(cartSidebar);

    // Restore CSS transition after component is safely mounted
    requestAnimationFrame(() => {
        setTimeout(() => cartSidebar.style.transition = '', 50);
    });

    document.getElementById('closeCartBtn').addEventListener('click', toggleCart);
    document.getElementById('checkoutBtn').addEventListener('click', openCheckout);

    // Inject Checkout Modal HTML
    const checkoutModal = document.createElement('div');
    checkoutModal.id = 'checkoutModal';
    checkoutModal.className = 'checkout-modal';
    checkoutModal.innerHTML = `
        <div class="checkout-content">
            <button class="close-checkout" id="closeCheckoutBtn">&times;</button>
            <h2>Complete Your Order</h2>
            <form id="checkoutForm">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="custName" required>
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="custEmail" required>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="tel" id="custPhone" required>
                </div>
                <div class="form-group">
                    <label>Delivery Address</label>
                    <textarea id="custAddress" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label>Payment Method</label>
                    <select id="payMethod">
                        <option value="pod">Pay on Delivery</option>
                        <option value="online">Pay Online (Card/Bank Transfer)</option>
                    </select>
                </div>
                <div class="checkout-total-row">
                    <span>Total to Pay:</span> <span id="checkoutTotal">&#8358;0</span>
                </div>
                <button type="submit" class="place-order-btn">Place Order</button>
            </form>
        </div>
    `;
    document.body.appendChild(checkoutModal);

    document.getElementById('closeCheckoutBtn').addEventListener('click', closeCheckout);
    document.getElementById('checkoutForm').addEventListener('submit', processOrder);

    // Inject Floating WhatsApp Support Button
    const floatWa = document.createElement('a');
    floatWa.href = `https://wa.me/${APP_CONFIG.phone}?text=Hello%20OMODARA%20TASTY,%20I%20need%20some%20help`;
    floatWa.target = '_blank';
    floatWa.className = 'floating-whatsapp';
    floatWa.setAttribute('aria-label', 'Contact Customer Support on WhatsApp');
    floatWa.innerHTML = '<i class="fab fa-whatsapp"></i>';
    document.body.appendChild(floatWa);

    // Inject Profile / Auth Modal HTML
    const profileModal = document.createElement('div');
    profileModal.id = 'profileModal';
    profileModal.className = 'checkout-modal';
    profileModal.innerHTML = `
        <div class="checkout-content" style="max-width: 600px;">
            <button class="close-checkout" id="closeProfileBtn">&times;</button>
            <h2>Your Profile</h2>
            <div id="profileInfo" style="margin-bottom: 20px; display: flex; align-items: center; gap: 15px;"></div>
            <h3 style="font-family:'Playfair Display',serif; font-size: 20px; margin-bottom: 15px;">Order History</h3>
            <div id="orderHistoryList" style="max-height: 300px; overflow-y: auto; margin-bottom: 20px; padding-right: 10px;">
                <p style="color: rgba(255,255,255,0.6);">Loading orders...</p>
            </div>
            <button id="logoutBtn" class="btn btn-outline" style="width: 100%; justify-content: center;">Sign Out</button>
        </div>
    `;
    document.body.appendChild(profileModal);

    document.getElementById('closeProfileBtn').addEventListener('click', () => profileModal.classList.remove('active'));
    document.getElementById('logoutBtn').addEventListener('click', () => {
        signOut(auth);
        profileModal.classList.remove('active');
        showToast('Signed out successfully', 'success');
    });

    // Dedicated Login Page Handler
    const loginPageForm = document.getElementById('loginPageForm');
    if (loginPageForm) {
        loginPageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const pass = document.getElementById('loginPassword').value;
            try {
                await signInWithEmailAndPassword(auth, email, pass);
                showToast("Welcome back!", "success");
                window.location.href = 'index.html';
            } catch (error) {
                handleAuthError(error);
            }
        });
    }

    // Dedicated Signup Page Handler
    const signupPageForm = document.getElementById('signupPageForm');
    if (signupPageForm) {
        signupPageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const pass = document.getElementById('signupPassword').value;
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
                await updateProfile(userCredential.user, { displayName: name });
                showToast("Account created successfully!", "success");
                window.location.href = 'index.html';
            } catch (error) {
                handleAuthError(error);
            }
        });
    }

    // Shared Google Auth for dedicated pages
    const googleAuthBtns = ['googleLoginBtn', 'googleSignupBtn'];
    googleAuthBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.onclick = async () => {
                try {
                    await signInWithPopup(auth, googleProvider);
                    window.location.href = 'index.html';
                } catch (error) {
                    handleAuthError(error);
                }
            };
        }
    });

    let currentUser = null;

    // Auth State Observer
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        let authBtn = document.getElementById('nav-auth');
        if (!authBtn) {
            const navMenu = document.getElementById('navMenu');
            if (navMenu) {
                const li = document.createElement('li');
                li.innerHTML = `<a href="#" id="nav-auth" class="nav-auth-link"><i class="fas fa-user"></i> Login</a>`;
                navMenu.insertBefore(li, navMenu.lastElementChild);
                authBtn = document.getElementById('nav-auth');
            }
        }
        if (authBtn) {
            if (user) {
                authBtn.innerHTML = `<img src="${user.photoURL}" alt="Profile" style="width:22px; height:22px; border-radius:50%; vertical-align:middle; margin-right:6px; border: 1px solid var(--gold);"> ${user.displayName.split(' ')[0]}`;
                authBtn.onclick = (e) => { e.preventDefault(); openProfile(); };
            } else {
                authBtn.innerHTML = `<i class="fas fa-user"></i> Login`;
                authBtn.onclick = (e) => { 
                    e.preventDefault(); 
                    window.location.href = 'login.html';
                };
            }
        }
    });

    async function openProfile() {
        profileModal.classList.add('active');
        if (!currentUser) return;
        document.getElementById('profileInfo').innerHTML = `
            <img src="${currentUser.photoURL}" alt="User" style="width:64px; height:64px; border-radius:50%; border:2px solid var(--gold);">
            <div>
                <h4 style="margin:0; font-size:18px;">${currentUser.displayName}</h4>
                <p style="margin:0; color:rgba(255,255,255,0.6);">${currentUser.email}</p>
            </div>
        `;
        
        const historyList = document.getElementById('orderHistoryList');
        historyList.innerHTML = '<p style="color: rgba(255,255,255,0.6);">Loading orders...</p>';
        
        try {
            const q = query(collection(db, "orders"), where("customer_email", "==", currentUser.email));
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                historyList.innerHTML = '<p style="color: rgba(255,255,255,0.6);">No orders found.</p>';
                return;
            }
            let html = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                const date = new Date(data.createdAt).toLocaleDateString();
                html += `
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(212,164,55,0.2); border-radius: 12px; padding: 15px; margin-bottom: 10px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                            <strong style="color:var(--gold);">${date}</strong>
                            <span style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 10px; font-size: 12px;">${data.status || 'Completed'}</span>
                        </div>
                        <div style="font-size: 14px; color: rgba(255,255,255,0.8);">${data.order_items.map(i => `${i.quantity}x ${i.name}`).join('<br>')}</div>
                        <div style="margin-top:12px; font-weight:bold; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">Total: ₦${(data.total_amount || 0).toLocaleString()}</div>
                    </div>
                `;
            });
            historyList.innerHTML = html;
        } catch (error) {
            console.error(error);
            historyList.innerHTML = '<p style="color: rgba(255,100,100,0.8);">Failed to load orders.</p>';
        }
    }

    function handleAuthError(error) {
        let message = "Authentication failed. Please try again.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            message = "Invalid email or password.";
        } else if (error.code === 'auth/email-already-in-use') {
            message = "This email is already registered.";
        } else if (error.code === 'auth/weak-password') {
            message = "Password should be at least 6 characters.";
        } else if (error.code === 'auth/popup-closed-by-user') {
            return; // Silent return for user cancellation
        }
        showToast(message, "error");
    }

    // Initialize Search & Filter if on Menu page
    initMenuSearch();

    // Testimonial Auto-Slider
    const testimonialTrack = document.getElementById('testimonialTrack');
    if (testimonialTrack) {
        // Clone cards for seamless infinite loop effect
        const originalCards = Array.from(testimonialTrack.children);
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            testimonialTrack.appendChild(clone);
        });

        const cards = Array.from(testimonialTrack.children);
        let currentIndex = 0;

        function moveSlider() {
            if (!testimonialTrack) return;
            const cardWidth = cards[0].offsetWidth;
            const gap = parseFloat(window.getComputedStyle(testimonialTrack).gap) || 0;
            
            // Seamless loop transition reset
            if (currentIndex >= originalCards.length) {
                testimonialTrack.style.transition = 'none';
                testimonialTrack.style.transform = `translateX(0px)`;
                currentIndex = 0;
                // Force reflow
                void testimonialTrack.offsetWidth;
                testimonialTrack.style.transition = 'transform 0.6s ease-in-out';
            }
            
            currentIndex++;
            const moveAmount = (cardWidth + gap) * currentIndex;
            testimonialTrack.style.transform = `translateX(-${moveAmount}px)`;
        }

        // Pause sliding while hovering over testimonials
        let sliderInterval = setInterval(moveSlider, 3500);
        
        testimonialTrack.parentElement.addEventListener('mouseenter', () => clearInterval(sliderInterval));
        testimonialTrack.parentElement.addEventListener('mouseleave', () => {
            sliderInterval = setInterval(moveSlider, 3500);
        });
    }

    // Initialize Cart UI
    updateCartUI();

    // Dynamic Footer Year Update
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
});

// Loader
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('hidden');
    }, 1500);
});

// Header scroll
const header = document.getElementById('header');
let isScrolling = false;
window.addEventListener('scroll', () => {
    if (header && !isScrolling) {
        window.requestAnimationFrame(() => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            isScrolling = false;
        });
        isScrolling = true;
    }
});

// Mobile menu
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');
if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

// Counter animation
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.counter-number');
            counters.forEach(counter => {
                const target = parseFloat(counter.getAttribute('data-target'));
                const isDecimal = target % 1 !== 0;
                const duration = 2000;
                const start = 0;
                const startTime = performance.now();
                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeProgress = 1 - Math.pow(1 - progress, 3);
                    const current = start + (target - start) * easeProgress;
                    if (isDecimal) {
                        counter.textContent = current.toFixed(1);
                    } else {
                        counter.textContent = Math.floor(current).toLocaleString();
                    }
                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    }
                }
                requestAnimationFrame(updateCounter);
            });
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });
document.querySelectorAll('.counter-section').forEach(section => counterObserver.observe(section));

// Active nav
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-menu a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});

// --- Page Specific Functions ---

function showMenu(category, btn) {
    document.querySelectorAll('.menu-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
    const target = document.getElementById(category);
    if (target) target.classList.add('active');
    if (btn) btn.classList.add('active');
    setTimeout(() => {
        document.querySelectorAll('.menu-section.active .animate-on-scroll').forEach(el => {
            el.classList.remove('visible');
            setTimeout(() => el.classList.add('visible'), 50);
        });
    }, 100);
}

function filterGallery(category, btn) {
    document.querySelectorAll('.gallery-filter').forEach(f => f.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.gallery-item').forEach(item => {
        if (category === 'all' || item.dataset.category.includes(category)) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

function showDay(day, btn) {
    document.querySelectorAll('.day-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
    const target = document.getElementById(day);
    if (target) target.classList.add('active');
    if (btn) btn.classList.add('active');
    setTimeout(() => {
        document.querySelectorAll('.day-section.active .animate-on-scroll').forEach(el => {
            el.classList.remove('visible');
            setTimeout(() => el.classList.add('visible'), 50);
        });
    }, 100);
}

function toggleFaq(element) {
    const item = element.closest('.faq-item');
    const wasActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!wasActive) item.classList.add('active');
    element.setAttribute('aria-expanded', !wasActive);
}

function initMenuSearch() {
    const searchInput = document.getElementById('menuSearch');
    const dietFilters = document.querySelectorAll('.diet-filter-cb');
    if (!searchInput && dietFilters.length === 0) return;

    function filterItems() {
        const term = searchInput ? searchInput.value.toLowerCase() : '';
        const activeDiets = Array.from(dietFilters).filter(cb => cb.checked).map(cb => cb.value.toLowerCase());
        document.querySelectorAll('.menu-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            const matchesSearch = text.includes(term);
            const matchesDiet = activeDiets.length === 0 || activeDiets.every(diet => text.includes(diet));
            item.style.display = (matchesSearch && matchesDiet) ? 'block' : 'none';
        });
    }
    if (searchInput) searchInput.addEventListener('input', filterItems);
    dietFilters.forEach(cb => cb.addEventListener('change', filterItems));
}

// ==========================================
// SHOPPING CART STATE & LOGIC
// ==========================================
let cart = JSON.parse(localStorage.getItem('omodara_cart')) || [];

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) cartSidebar.classList.toggle('active');
}

function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar && !cartSidebar.classList.contains('active')) {
        toggleCart();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function updateQuantity(id, delta) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function saveCart() {
    localStorage.setItem('omodara_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';
    let total = 0;
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center;margin-top:20px;color:rgba(255,255,255,0.5)">Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>&#8358;${item.price.toLocaleString()}</p>
                    <div class="cart-quantity">
                        <button class="qty-minus" data-qty-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-plus" data-qty-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-btn" data-remove-id="${item.id}">&times;</button>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
        // Bind quantity buttons
        cartItemsContainer.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', () => updateQuantity(btn.getAttribute('data-qty-id'), -1));
        });
        cartItemsContainer.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', () => updateQuantity(btn.getAttribute('data-qty-id'), 1));
        });
        cartItemsContainer.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(btn.getAttribute('data-remove-id')));
        });
    }
    if (cartTotalElement) {
        cartTotalElement.textContent = `₦${total.toLocaleString()}`;
    }
    
    // Update floating cart badge in navigation
    const navCart = document.getElementById('nav-cart');
    if (navCart) {
        let badge = navCart.querySelector('.cart-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cart-badge';
            navCart.appendChild(badge);
        }
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
        }
    }
}

// ==========================================
// CHECKOUT & PAYMENT LOGIC
// ==========================================
function openCheckout() {
    if (cart.length === 0) {
        showToast("Your cart is empty!", 'error');
        return;
    }
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkoutTotal').textContent = `₦${total.toLocaleString()}`;
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('checkoutModal').classList.add('active');
}

function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
    toggleCheckoutLoading(false);
}

function toggleCheckoutLoading(isLoading) {
    const btn = document.querySelector('.place-order-btn');
    if (btn) {
        btn.disabled = isLoading;
        btn.textContent = isLoading ? 'Processing...' : 'Place Order';
        btn.style.opacity = isLoading ? '0.7' : '1';
        btn.style.cursor = isLoading ? 'not-allowed' : 'pointer';
    }
}

function processOrder(event) {
    event.preventDefault();
    toggleCheckoutLoading(true);
    
    if (cart.length === 0) {
        showToast("Your cart is empty!", "error");
        return;
    }

    const customer = {
        name: document.getElementById('custName').value,
        email: document.getElementById('custEmail').value,
        phone: document.getElementById('custPhone').value,
        address: document.getElementById('custAddress').value,
        payMethod: document.getElementById('payMethod').value
    };
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (customer.payMethod === 'online') {
        if (typeof PaystackPop === 'undefined' || PAYSTACK_PUBLIC_KEY.includes('YOUR_PAYSTACK')) {
            showToast("Payment gateway loading, please try again in a moment.", "info");
            toggleCheckoutLoading(false);
            return;
        }
        let handler = PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: customer.email,
            amount: total * 100,
            currency: 'NGN',
            ref: 'ORD_' + Math.floor((Math.random() * 1000000000) + 1),
            callback: function (response) {
                completeOrder(customer, total, response.reference);
            },
            onClose: function () {
                showToast('Transaction was cancelled.', 'error');
                toggleCheckoutLoading(false);
            }
        });
        handler.openIframe();
    } else {
        completeOrder(customer, total, 'PAY_ON_DELIVERY');
    }
}

async function completeOrder(customer, total, reference) {
    const orderSummary = cart.map(item => `${item.quantity}x ${item.name} (₦${item.price * item.quantity})`).join('\n');
    const templateParams = {
        to_name: "Omodara Tasty Admin",
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        delivery_address: customer.address,
        payment_method: customer.payMethod,
        payment_reference: reference,
        order_summary: orderSummary,
        total_amount: `₦${total.toLocaleString()}`
    };
    try {
        await addDoc(collection(db, "orders"), {
            customer_name: customer.name,
            customer_email: customer.email,
            customer_phone: customer.phone,
            delivery_address: customer.address,
            payment_method: customer.payMethod,
            payment_reference: reference,
            order_items: cart,
            total_amount: total,
            status: "New",
            createdAt: new Date().toISOString()
        });
        console.log("Order saved to Firebase!");
    } catch (error) {
        console.error("Error saving order: ", error);
    }
    if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.SERVICE_ID !== 'YOUR_SERVICE_ID') {
        emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams)
            .then(function () {
                showToast(`Order placed successfully! Reference: ${reference}. An email receipt has been sent.`, 'success');
                cart = []; saveCart(); updateCartUI(); closeCheckout();
            }, function (error) {
                showToast('Order placed but email notification failed.', 'error');
                console.error('EmailJS error:', error);
                cart = []; saveCart(); updateCartUI(); closeCheckout();
            });
    } else {
        showToast("Order placed successfully! Your food will be delivered soon.", 'success');
        cart = []; saveCart(); updateCartUI(); closeCheckout();
    }
}

// ==========================================
// AI MENU ASSISTANT
// ==========================================
const MENU_DATA = {
    business: {
        name: "OMODARA TASTY",
        phone: "+234 907 949 0452",
        location: "Lagos, Nigeria",
        hours: "Mon-Fri 8AM-10PM, Sat 9AM-11PM, Sun 10AM-9PM",
        delivery: "Delivery available across Lagos. Order via website cart or WhatsApp."
    },
    categories: {
        breakfast: {
            label: "Breakfast & Snacks",
            items: [
                { name: "Akara & Koko Special", price: "₦3,000", desc: "Hot, fresh bean cakes served with traditional hot pap.", tags: ["vegan"] },
                { name: "Moimoi & Koko Special", price: "₦5,000", desc: "Steamed bean pudding paired with warm traditional pap." },
                { name: "Beans & Koko Special", price: "₦4,000", desc: "Soft, savory beans stew paired with breakfast pap.", tags: ["vegan"] },
                { name: "Apple Cake", price: "₦1,000", desc: "Freshly baked, moist and sweet apple cake slices." },
                { name: "Burger Chicken", price: "₦3,000", desc: "Crispy chicken burger with fresh lettuce and house sauce." },
                { name: "Maakouda", price: "₦800", desc: "Crispy fried potato and herb fritters.", tags: ["vegan"] }
            ]
        },
        stews: {
            label: "Stews & Sauces",
            items: [
                { name: "Beef Stew", price: "₦20,000 (1L) – ₦75,000 (5L)", desc: "Rich, slow-cooked beef in tomato and pepper sauce." },
                { name: "Turkey Stew", price: "₦25,000 (1L) – ₦80,000 (5L)", desc: "Premium turkey slow-cooked in savory pepper sauce." },
                { name: "Assorted Meat Stew", price: "₦20,000 (1L) – ₦70,000 (5L)", desc: "Mixed meat stew with assorted cuts." },
                { name: "Ayamase Sauce", price: "₦20,000 (1L) – ₦80,000 (5L)", desc: "Designer green pepper sauce (ofada style).", tags: ["spicy"] },
                { name: "Snail Sauce", price: "₦28,000 (1L) – ₦85,000 (3.5L)", desc: "Premium jumbo snails in spicy sauce.", tags: ["premium"] },
                { name: "Curry Chicken Sauce", price: "₦22,000 (1L) – ₦80,000 (5L)", desc: "Mild curry-infused chicken sauce." }
            ]
        },
        soups: {
            label: "Soups & Seafood",
            items: [
                { name: "Egusi Soup", price: "₦20,000 (1L) – ₦50,000 (3.5L)", desc: "Rich melon seed soup, a Nigerian classic.", tags: ["popular"] },
                { name: "Eforiro", price: "₦22,000 (1L) – ₦50,000 (3.5L)", desc: "Fresh vegetable soup cooked with assorted meat." },
                { name: "Okro Soup", price: "₦20,000 (1L) – ₦50,000 (3.5L)", desc: "Smooth okro soup with assorted fish and meat." },
                { name: "White Soup", price: "₦22,000 (1L) – ₦50,000 (3.5L)", desc: "Traditional Southeast Nigerian soup with a unique flavor." },
                { name: "Fisherman Soup", price: "₦24,000 (2.5L) – ₦70,000 (5L)", desc: "Rich seafood soup with fresh catch.", tags: ["seafood"] },
                { name: "Seafood Pepper Soup", price: "₦25,000 (2.5L) – ₦70,000 (5L)", desc: "Spicy pepper soup loaded with seafood.", tags: ["spicy", "seafood"] }
            ]
        },
        rice: {
            label: "Rice & Pasta",
            items: [
                { name: "Smoky Party Jollof", price: "₦15,000 (2.5L) – ₦35,000 (5L)", desc: "Our signature party jollof rice — smoky, rich, and delicious.", tags: ["bestseller", "popular"] },
                { name: "Oriental Fried Rice", price: "₦15,000 (2.5L) – ₦35,000 (5L)", desc: "Stir-fried rice with vegetables and seasonings." },
                { name: "Jollof Combo Tray", price: "₦25,000 (2.5L + 5 proteins) – ₦50,000 (5L + 15 proteins)", desc: "Jollof rice with assorted protein mix.", tags: ["combo", "popular"] },
                { name: "Native Pasta", price: "₦17,000 (2.5L) – ₦42,000 (5L)", desc: "Locally-inspired pasta with Nigerian flavors." }
            ]
        },
        proteins: {
            label: "Proteins & Extras",
            items: [
                { name: "Whole Guinea Fowl", price: "₦25,000", desc: "Whole grilled guinea fowl seasoned perfectly." },
                { name: "Sauteed Snail (10pcs)", price: "₦45,000", desc: "Premium jumbo snails in spicy onion and pepper mix.", tags: ["premium"] },
                { name: "Peppered Goat Meat", price: "₦2,000/pc", desc: "Tender goat meat in spicy sauce.", tags: ["spicy"] },
                { name: "Classic Salad Tray", price: "₦12,000 (2.5 tray) – ₦20,000 (med tray)", desc: "Fresh mixed salad with dressing." }
            ]
        },
        drinks: {
            label: "Health Blends",
            items: [
                { name: "Immune Boost", price: "₦5,000", desc: "Apple, Cucumber, Celery, Ginger, Lemon.", tags: ["healthy"] },
                { name: "Heart Health", price: "₦5,000", desc: "Papaya, Hemp hearts, Flax seeds.", tags: ["healthy"] },
                { name: "Hormonal Balance", price: "₦5,000", desc: "Pomegranate, Flax seeds, Pumpkin seeds.", tags: ["healthy"] },
                { name: "Tiger Nut Milk", price: "₦2,000", desc: "Pure extract, cold and refreshing.", tags: ["healthy"] }
            ]
        }
    },
    specials: [
        { day: "Monday", name: "Monday Jollof Feast", price: "₦6,500", desc: "Family-size Jollof Rice with 4 pieces of grilled chicken, plantain, and coleslaw." },
        { day: "Monday", name: "Free Juice Monday", price: "FREE", desc: "Order any main dish and get a complimentary fresh tropical juice." },
        { day: "Tuesday", name: "Pasta Tuesday", price: "20% OFF", desc: "Any pasta dish with garlic bread and a side salad." },
        { day: "Tuesday", name: "Burger & Fries Combo", price: "₦4,500", desc: "Any burger with large fries and a drink." },
        { day: "Wednesday", name: "Wing Wednesday", price: "₦3,000", desc: "10 pieces of spicy chicken wings with dipping sauce." },
        { day: "Wednesday", name: "Fresh Bread Wednesday", price: "B2G1 FREE", desc: "Buy 2 croissants, get 1 free." },
        { day: "Thursday", name: "Steak Thursday", price: "₦7,500", desc: "Any steak dish with a complimentary glass of wine." },
        { day: "Thursday", name: "Soup of the Day", price: "₦2,000", desc: "Chef's special soup with fresh bread rolls." },
        { day: "Friday", name: "Friday Seafood Platter", price: "₦8,000", desc: "Grilled prawns, fish fillet, and calamari with rice." },
        { day: "Friday", name: "Family Pizza Night", price: "₦5,500", desc: "Large pizza with 2 toppings and 4 soft drinks." },
        { day: "Saturday", name: "Saturday Brunch", price: "₦3,500", desc: "Pancakes, eggs, sausages, bacon, and fresh juice." },
        { day: "Saturday", name: "Smoothie Saturday", price: "30% OFF", desc: "Any large smoothie at 30% off." },
        { day: "Sunday", name: "Sunday Roast", price: "₦5,000", desc: "Traditional Sunday roast chicken with all the trimmings." },
        { day: "Sunday", name: "Sunday Dessert Special", price: "FREE COFFEE", desc: "Any dessert with a complimentary coffee or tea." }
    ]
};

const AI_CONFIG = {
    API_KEY: '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',
    MODEL: 'openrouter/free',
    SITE_URL: 'https://omodaratasty.ng',
    SITE_NAME: 'OMODARA TASTY'
};

function buildSystemPrompt() {
    let prompt = `You are OMODARA TASTY's friendly AI menu assistant. You help customers with menu questions, food recommendations, and information about the restaurant.

RULES:
- Only answer based on the menu provided below. Never make up dishes or prices.
- Be warm, concise, and helpful. Keep responses under 120 words unless the user asks for details.
- When recommending, consider: budget, spice preference, group size, meal time, dietary needs.
- Include prices when mentioning items.
- If asked about availability or ingredients, use the descriptions provided.
- If asked something outside the restaurant's scope, politely redirect to the menu.
- If the user wants to order, guide them to use the "Add to Cart" buttons on the website menu page.
- If they need help beyond what you can offer, suggest they call or WhatsApp the restaurant.

HOURS: ${MENU_DATA.business.hours}
PHONE: ${MENU_DATA.business.phone}
LOCATION: ${MENU_DATA.business.location}
DELIVERY: ${MENU_DATA.business.delivery}

MENU ITEMS:\n`;

    for (const key in MENU_DATA.categories) {
        const cat = MENU_DATA.categories[key];
        prompt += `\n--- ${cat.label} ---\n`;
        cat.items.forEach(item => {
            prompt += `- ${item.name} | ${item.price} | ${item.desc}`;
            if (item.tags && item.tags.length) prompt += ` [${item.tags.join(', ')}]`;
            prompt += '\n';
        });
    }

    prompt += `\n--- DAILY SPECIALS ---\n`;
    MENU_DATA.specials.forEach(s => {
        prompt += `- ${s.day}: ${s.name} | ${s.price} | ${s.desc}\n`;
    });

    return prompt;
}

function initAIChat() {
    if (document.getElementById('aiChatPanel')) return;

    const trigger = document.createElement('button');
    trigger.id = 'aiChatTrigger';
    trigger.className = 'ai-chat-trigger';
    trigger.setAttribute('aria-label', 'Open AI Menu Assistant');
    trigger.innerHTML = '<i class="fas fa-robot"></i><span class="trigger-label">Menu Assistant</span>';

    const panel = document.createElement('div');
    panel.id = 'aiChatPanel';
    panel.className = 'ai-chat-panel';
    panel.innerHTML = `
        <div class="ai-chat-header">
            <div class="ai-chat-header-icon"><i class="fas fa-robot"></i></div>
            <div class="ai-chat-header-info">
                <h4>OMODARA TASTY</h4>
                <p>Menu Assistant</p>
            </div>
            <button class="ai-chat-close" id="aiChatClose" aria-label="Close chat">&times;</button>
        </div>
        <div class="ai-chat-messages" id="aiChatMessages">
            <div class="ai-msg bot">
                Hey there! 👋 Ask me anything about our menu — I can help with recommendations, prices, ingredients, and daily specials!
                <div class="ai-msg-time">Just now</div>
            </div>
        </div>
        <div class="ai-chat-input">
            <input type="text" id="aiChatInput" placeholder="Ask about our menu..." autocomplete="off">
            <button class="ai-chat-send" id="aiChatSend" aria-label="Send message"><i class="fas fa-paper-plane"></i></button>
        </div>
    `;

    document.body.appendChild(trigger);
    document.body.appendChild(panel);

    let chatHistory = [];
    let isProcessing = false;

    function addMessage(text, role, time) {
        const msgs = document.getElementById('aiChatMessages');
        const div = document.createElement('div');
        div.className = `ai-msg ${role}`;
        div.innerHTML = `${text}<div class="ai-msg-time">${time || 'Just now'}</div>`;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function showTyping() {
        const msgs = document.getElementById('aiChatMessages');
        const div = document.createElement('div');
        div.className = 'ai-typing';
        div.id = 'aiTypingIndicator';
        div.innerHTML = '<span></span><span></span><span></span>';
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function hideTyping() {
        const el = document.getElementById('aiTypingIndicator');
        if (el) el.remove();
    }

    async function sendToAI(userMessage) {
        const systemPrompt = buildSystemPrompt();
        chatHistory.push({ role: 'user', content: userMessage });

        const messages = [
            { role: 'system', content: systemPrompt },
            ...chatHistory.slice(-12)
        ];

        try {
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AI_CONFIG.API_KEY}`,
                    'HTTP-Referer': AI_CONFIG.SITE_URL,
                    'X-Title': AI_CONFIG.SITE_NAME
                },
                body: JSON.stringify({
                    model: AI_CONFIG.MODEL,
                    messages: messages,
                    max_tokens: 300,
                    temperature: 0.7
                })
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content || "I'm not sure how to answer that. Could you rephrase?";
            chatHistory.push({ role: 'assistant', content: reply });
            return reply;
        } catch (err) {
            console.error('AI Chat error:', err);
            return "I'm having trouble connecting right now. Please reach out to us on WhatsApp at +234 907 949 0452 and we'll be happy to help!";
        }
    }

    async function handleSend() {
        const input = document.getElementById('aiChatInput');
        const msg = input.value.trim();
        if (!msg || isProcessing) return;

        isProcessing = true;
        input.value = '';
        document.getElementById('aiChatSend').disabled = true;

        addMessage(msg, 'user', 'Now');
        showTyping();

        const reply = await sendToAI(msg);

        hideTyping();
        addMessage(reply, 'bot');
        isProcessing = false;
        document.getElementById('aiChatSend').disabled = false;
        input.focus();
    }

    document.getElementById('aiChatTrigger').addEventListener('click', () => {
        document.getElementById('aiChatPanel').classList.toggle('active');
        document.getElementById('aiChatInput').focus();
    });

    document.getElementById('aiChatClose').addEventListener('click', () => {
        document.getElementById('aiChatPanel').classList.remove('active');
    });

    document.getElementById('aiChatSend').addEventListener('click', handleSend);

    document.getElementById('aiChatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend();
    });
}

document.addEventListener('DOMContentLoaded', initAIChat);
