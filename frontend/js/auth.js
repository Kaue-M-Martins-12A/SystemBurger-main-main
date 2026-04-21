// Authentication state management
const Auth = {
    isLoggedInState: false,
    user: null,

    isLoggedIn: () => Auth.isLoggedInState,
    getUser: () => Auth.user || {},

    init: async () => {
        try {
            const res = await fetch('/api/auth/check');
            const data = await res.json();
            Auth.isLoggedInState = data.isLoggedIn;
            Auth.user = data.user || null;
            if (data.error === 'BLOCKED') {
                alert('Sua conta foi desativada pelo Administrador.');
                Auth.isLoggedInState = false;
            }
        } catch (e) {
            Auth.isLoggedInState = false;
        }
        Auth.updateHeader();

        // Custom event for pages that need auth info at startup (e.g. Profile)
        document.dispatchEvent(new Event('authLoaded'));
    },

    login: async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                window.location.href = '/';
            } else {
                alert(data.error || 'Erro ao efetuar login');
            }
        } catch (error) {
            alert('Erro na conexão com o servidor.');
        }
    },

    register: async (name, email, password) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                window.location.href = '/';
            } else {
                alert(data.error || 'Erro ao efetuar cadastro');
            }
        } catch (error) {
            alert('Erro na conexão com o servidor.');
        }
    },

    logout: async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/';
        } catch (error) {
            alert('Erro ao sair da conta');
        }
    },

    updateHeader: () => {
        if (window.Components) {
            window.Components.renderHeader();
        } else {
            console.warn('Components.js not loaded, skipping header update');
        }
    }
};

// Initialize auth state automatically on page load
document.addEventListener('DOMContentLoaded', Auth.init);
window.Auth = Auth;
