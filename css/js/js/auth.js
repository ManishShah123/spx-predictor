// Authentication Handler
class AuthHandler {
    constructor() {
        this.initializeAuth();
        this.setupEventListeners();
    }

    initializeAuth() {
        // Check if user is already logged in
        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                this.handleAuthSuccess(user);
            } else {
                // User is signed out
                this.handleAuthSignOut();
            }
        });
    }

    setupEventListeners() {
        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Google signup
        const googleSignup = document.getElementById('googleSignup');
        if (googleSignup) {
            googleSignup.addEventListener('click', () => this.handleGoogleAuth());
        }

        // Google login
        const googleLogin = document.getElementById('googleLogin');
        if (googleLogin) {
            googleLogin.addEventListener('click', () => this.handleGoogleAuth());
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const tradingExperience = document.getElementById('tradingExperience').value;
        const terms = document.getElementById('terms').checked;

        // Validation
        if (!this.validateSignupForm(fullName, email, password, confirmPassword, tradingExperience, terms)) {
            return;
        }

        this.showLoading();

        try {
            // Create user account
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update user profile
            await user.updateProfile({
                displayName: fullName
            });

            // Save additional user data to Firestore
            await db.collection('users').doc(user.uid).set({
                fullName: fullName,
                email: email,
                tradingExperience: tradingExperience,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                preferences: {
                    theme: 'light',
                    notifications: true,
                    defaultVix: 14.2,
                    defaultVolatility: 12.5
                }
            });

            this.showSuccess('Account created successfully! Redirecting...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);

        } catch (error) {
            this.showError(this.getErrorMessage(error));
        } finally {
            this.hideLoading();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        this.showLoading();

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update last login
            await db.collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            this.showError(this.getErrorMessage(error));
        } finally {
            this.hideLoading();
        }
    }

    async handleGoogleAuth() {
        this.showLoading();

        try {
            const result = await auth.signInWithPopup(googleProvider);
            const user = result.user;

            // Check if this is a new user
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                // New user - save their data
                await db.collection('users').doc(user.uid).set({
                    fullName: user.displayName,
                    email: user.email,
                    tradingExperience: 'intermediate', // Default
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    preferences: {
                        theme: 'light',
                        notifications: true,
                        defaultVix: 14.2,
                        defaultVolatility: 12.5
                    }
                });
            } else {
                // Existing user - update last login
                await db.collection('users').doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            this.showSuccess('Authentication successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            this.showError(this.getErrorMessage(error));
        } finally {
            this.hideLoading();
        }
    }

    validateSignupForm(fullName, email, password, confirmPassword, tradingExperience, terms) {
        if (!fullName || !email || !password || !confirmPassword || !tradingExperience) {
            this.showError('Please fill in all fields');
            return false;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return false;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return false;
        }

        if (!terms) {
            this.showError('Please accept the terms and conditions');
            return false;
        }

        return true;
    }

    getErrorMessage(error) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return 'This email is already registered. Please use a different email or login.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/weak-password':
                return 'Password is too weak. Please use at least 6 characters.';
            case 'auth/user-not-found':
                return 'No account found with this email address.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later.';
            default:
                return error.message || 'An error occurred. Please try again.';
        }
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showError(message) {
        this.removeExistingMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const form = document.querySelector('.auth-form');
        if (form) {
            form.insertBefore(errorDiv, form.firstChild);
        }
    }

    showSuccess(message) {
        this.removeExistingMessages();
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        const form = document.querySelector('.auth-form');
        if (form) {
            form.insertBefore(successDiv, form.firstChild);
        }
    }

    removeExistingMessages() {
        const existingMessages = document.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());
    }
