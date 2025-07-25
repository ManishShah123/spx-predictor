// Authentication handler
document.addEventListener('DOMContentLoaded', function() {
    // Simple check for demo mode - no Firebase required
    checkAuthState();

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Signup form handler
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Google auth handlers
    const googleLogin = document.getElementById('googleLogin');
    const googleSignup = document.getElementById('googleSignup');
    
    if (googleLogin) {
        googleLogin.addEventListener('click', handleGoogleAuth);
    }
    
    if (googleSignup) {
        googleSignup.addEventListener('click', handleGoogleAuth);
    }
});

function checkAuthState() {
    // For demo mode, check if we're on dashboard without being "logged in"
    const isLoggedIn = sessionStorage.getItem('spx_demo_logged_in');
    const isDashboard = window.location.pathname.includes('dashboard.html');
    
    if (!isLoggedIn && isDashboard) {
        // Not logged in but trying to access dashboard
        window.location.href = 'login.html';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Basic validation
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    try {
        loadingOverlay.style.display = 'flex';
        console.log("user auth started - demo set up");
        // Demo login - accepts any valid email/password combination
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            
            // Set demo login state
            sessionStorage.setItem('spx_demo_logged_in', 'true');
            sessionStorage.setItem('spx_demo_user_email', email);
            
            showSuccess('Login successful!');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }, 1500);
        
        // Uncomment below for real Firebase authentication:
        console.log("user auth started");
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('User signed in:', userCredential.user);
        sessionStorage.setItem('spx_logged_in', 'true');
        window.location.href = 'dashboard.html';
        
        
    } catch (error) {
        loadingOverlay.style.display = 'none';
        showError('Login failed: ' + error.message);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const tradingExperience = document.getElementById('tradingExperience').value;
    const terms = document.getElementById('terms').checked;
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Validation
    if (!fullName || !email || !password || !confirmPassword || !tradingExperience) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    if (!terms) {
        showError('Please accept the terms and conditions');
        return;
    }
    
    try {
        loadingOverlay.style.display = 'flex';
        
        // Demo signup - create account simulation
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            
            // Set demo login state
            sessionStorage.setItem('spx_demo_logged_in', 'true');
            sessionStorage.setItem('spx_demo_user_email', email);
            sessionStorage.setItem('spx_demo_user_name', fullName);
            sessionStorage.setItem('spx_demo_user_experience', tradingExperience);
            
            showSuccess('Account created successfully!');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }, 2000);
        
        // Uncomment below for real Firebase authentication:
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Update profile with additional info
        await userCredential.user.updateProfile({
            displayName: fullName
        });
        
        // Save additional user data to Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            fullName: fullName,
            email: email,
            tradingExperience: tradingExperience,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('User created:', userCredential.user);
        sessionStorage.setItem('spx_logged_in', 'true');
        window.location.href = 'dashboard.html';
        
        
    } catch (error) {
        loadingOverlay.style.display = 'none';
        showError('Signup failed: ' + error.message);
    }
}

async function handleGoogleAuth() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    try {
        loadingOverlay.style.display = 'flex';
        
        // Demo Google auth simulation
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            
            // Set demo login state with Google user
            sessionStorage.setItem('spx_demo_logged_in', 'true');
            sessionStorage.setItem('spx_demo_user_email', 'demo@google.com');
            sessionStorage.setItem('spx_demo_user_name', 'Demo Google User');
            sessionStorage.setItem('spx_demo_auth_provider', 'google');
            
            showSuccess('Google authentication successful!');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }, 1500);
        
        // Uncomment below for real Firebase Google authentication:
        
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        console.log('Google sign-in successful:', result.user);
        sessionStorage.setItem('spx_logged_in', 'true');
        window.location.href = 'dashboard.html';
        
        
    } catch (error) {
        loadingOverlay.style.display = 'none';
        showError('Google authentication failed: ' + error.message);
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(message) {
    // Remove any existing notifications
    removeExistingNotifications();
    
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'notification error-notification';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        font-weight: 500;
        max-width: 300px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease-out;
    `;
    errorDiv.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        position: absolute;
        top: 5px;
        right: 10px;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
    `;
    closeBtn.onclick = () => errorDiv.remove();
    errorDiv.appendChild(closeBtn);
    
    document.body.appendChild(errorDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => errorDiv.remove(), 300);
        }
    }, 5000);
}

function showSuccess(message) {
    // Remove any existing notifications
    removeExistingNotifications();
    
    // Create success notification
    const successDiv = document.createElement('div');
    successDiv.className = 'notification success-notification';
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        font-weight: 500;
        max-width: 300px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease-out;
    `;
    successDiv.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        position: absolute;
        top: 5px;
        right: 10px;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
    `;
    closeBtn.onclick = () => successDiv.remove();
    successDiv.appendChild(closeBtn);
    
    document.body.appendChild(successDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => successDiv.remove(), 300);
        }
    }, 3000);
}

function removeExistingNotifications() {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
}

// Logout function
function logout() {
    // Clear demo session
    sessionStorage.removeItem('spx_demo_logged_in');
    sessionStorage.removeItem('spx_demo_user_email');
    sessionStorage.removeItem('spx_demo_user_name');
    sessionStorage.removeItem('spx_demo_user_experience');
    sessionStorage.removeItem('spx_demo_auth_provider');
    
    showSuccess('Logged out successfully!');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
    
    // Uncomment below for real Firebase logout:
    
    auth.signOut().then(() => {
        sessionStorage.removeItem('spx_logged_in');
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Logout error:', error);
        showError('Logout failed');
    });
    
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Make logout function globally available
window.logout = logout;