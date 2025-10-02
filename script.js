// Enhanced interactions and video handling
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('background-video');
    const diveButton = document.querySelector('.dive-button');
    const scrollArrow = document.querySelector('.scroll-arrow');
    
    // Ensure video plays properly
    video.addEventListener('loadeddata', function() {
        video.play().catch(function(error) {
            console.log('Video autoplay failed:', error);
        });
    });
    
    // Handle video loading errors gracefully
    video.addEventListener('error', function(e) {
        console.log('Video loading error:', e);
        // Fallback: set a dark background
        document.querySelector('.hero-section').style.background = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
    });
    
    
    
    
    // Enhanced Intersection Observer for smooth scroll animations
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
            }
        });
    }, observerOptions);
    
    // Observe social links for staggered animation
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach((link, index) => {
        link.style.opacity = '0';
        link.style.transform = 'translateY(50px) scale(0.9)';
        link.style.transition = `all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.15}s`;
        
        // Add enhanced hover effects
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        observer.observe(link);
    });
    
    // Enhanced intersection observer for social links with smoother triggers
    const enhancedObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add a small delay for staggered effect
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                }, index * 100);
            }
        });
    }, { 
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    });
    
    socialLinks.forEach(link => enhancedObserver.observe(link));
    
    
    // Ensure video maintains aspect ratio on resize
    function adjustVideoSize() {
        const video = document.getElementById('background-video');
        if (!video.videoWidth || !video.videoHeight) return;
        
        const windowRatio = window.innerWidth / window.innerHeight;
        const videoRatio = video.videoWidth / video.videoHeight;
        
        if (windowRatio > videoRatio) {
            video.style.width = '100%';
            video.style.height = 'auto';
        } else {
            video.style.width = 'auto';
            video.style.height = '100%';
        }
    }
    
    // Adjust video size on load and resize
    video.addEventListener('loadedmetadata', adjustVideoSize);
    window.addEventListener('resize', adjustVideoSize);
    
    // Add performance optimization: pause video when tab is not visible
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            video.pause();
        } else {
            video.play().catch(console.log);
        }
    });
});

// Smooth scroll functions
function scrollToSocials() {
    const socialsSection = document.getElementById('socials');
    if (socialsSection) {
        // Immediate scroll for instant response
        socialsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// EmailJS Configuration
// Replace these with your actual EmailJS credentials
const EMAILJS_CONFIG = {
    PUBLIC_KEY: 'k1T3wdSQh4ZroKbUb',
    SERVICE_ID: 'service_secdk22', 
    TEMPLATE_ID: 'template_h5lhjrh'
};

// Initialize EmailJS
document.addEventListener('DOMContentLoaded', function() {
    // Initialize EmailJS with your public key
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            showFormLoading();
            
            // Get form data
            const formData = new FormData(contactForm);
            const templateParams = {
                from_name: formData.get('name'),
                from_email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                to_name: 'Charlie Brockmeier',
                to_email: 'charliebrockmeier@gmail.com',
                reply_to: formData.get('email')
            };
            
            // Send email using EmailJS
            emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                templateParams
            ).then(function(response) {
                console.log('Email sent successfully:', response);
                showFormSuccess();
            }).catch(function(error) {
                console.error('Email sending failed:', error);
                showFormError();
            });
        });
    }
});

function showFormLoading() {
    const submitButton = document.querySelector('.submit-button');
    submitButton.innerHTML = '<span class="button-text">Sending...</span><i class="fas fa-spinner fa-spin button-icon"></i>';
    submitButton.style.background = 'rgba(100, 181, 246, 0.3)';
    submitButton.style.borderColor = '#64b5f6';
    submitButton.disabled = true;
}

function showFormSuccess() {
    const submitButton = document.querySelector('.submit-button');
    const originalText = '<span class="button-text">Send Message</span><i class="fas fa-paper-plane button-icon"></i>';
    
    submitButton.innerHTML = '<span class="button-text">Message Sent!</span><i class="fas fa-check button-icon"></i>';
    submitButton.style.background = 'rgba(76, 175, 80, 0.3)';
    submitButton.style.borderColor = '#4CAF50';
    submitButton.disabled = false;
    
    setTimeout(() => {
        submitButton.innerHTML = originalText;
        submitButton.style.background = '';
        submitButton.style.borderColor = '';
        document.getElementById('contactForm').reset();
        closeContactModal();
    }, 2000);
}

function showFormError() {
    const submitButton = document.querySelector('.submit-button');
    const originalText = '<span class="button-text">Send Message</span><i class="fas fa-paper-plane button-icon"></i>';
    
    submitButton.innerHTML = '<span class="button-text">Failed to Send</span><i class="fas fa-exclamation-triangle button-icon"></i>';
    submitButton.style.background = 'rgba(244, 67, 54, 0.3)';
    submitButton.style.borderColor = '#f44336';
    submitButton.disabled = false;
    
    setTimeout(() => {
        submitButton.innerHTML = originalText;
        submitButton.style.background = '';
        submitButton.style.borderColor = '';
    }, 3000);
}

// Modal functions
function openContactModal() {
    const modal = document.getElementById('contactModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Add entrance animation
    setTimeout(() => {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.transform = 'scale(1) translateY(0)';
    }, 10);
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset form
    setTimeout(() => {
        document.getElementById('contactForm').reset();
    }, 300);
}

// Relax mode functions
function enterRelaxMode() {
    const relaxMode = document.getElementById('relaxMode');
    const relaxVideo = document.getElementById('relax-video');
    
    // Show relax mode
    relaxMode.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Start the relax video
    relaxVideo.play().catch(console.log);
}

function exitRelaxMode() {
    const relaxMode = document.getElementById('relaxMode');
    const relaxVideo = document.getElementById('relax-video');
    
    // Hide relax mode
    relaxMode.classList.remove('active');
    document.body.style.overflow = '';
    
    // Pause the relax video
    relaxVideo.pause();
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const contactModal = document.getElementById('contactModal');
    
    if (e.target === contactModal) {
        closeContactModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeContactModal();
    }
});

// Add particle effect on social link clicks
document.addEventListener('DOMContentLoaded', function() {
    const socialLinks = document.querySelectorAll('.social-link');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            createParticleEffect(e.target, this.dataset.platform);
        });
    });
});

function createParticleEffect(element, platform) {
    const colors = {
        instagram: ['#f09433', '#e6683c', '#dc2743'],
        x: ['#000000', '#333333', '#666666'],
        linkedin: ['#0077b5', '#005885', '#003d5c']
    };
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = colors[platform] ? colors[platform][i % colors[platform].length] : '#ffffff';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        
        document.body.appendChild(particle);
        
        const angle = (i / 12) * Math.PI * 2;
        const velocity = 100 + Math.random() * 50;
        const lifetime = 800 + Math.random() * 400;
        
        particle.animate([
            { 
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            { 
                transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: lifetime,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => particle.remove();
    }
}

// Add CSS for ripple effect dynamically
const style = document.createElement('style');
style.textContent = `
    .dive-button {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Footer scroll visibility with throttling for better performance
let footerScrollTimeout;
function handleFooterVisibility() {
    if (footerScrollTimeout) return;
    
    footerScrollTimeout = requestAnimationFrame(() => {
        const footer = document.querySelector('.footer-nav');
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Show footer when scrolled to bottom 20% of page
        const scrollPercentage = (scrollPosition + windowHeight) / documentHeight;
        
        if (scrollPercentage > 0.8) {
            footer.classList.add('visible');
        } else {
            footer.classList.remove('visible');
        }
        
        footerScrollTimeout = null;
    });
}


// Initialize footer scroll functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle footer visibility on scroll
    window.addEventListener('scroll', handleFooterVisibility);
    
    // Initial check for footer visibility
    handleFooterVisibility();
});
