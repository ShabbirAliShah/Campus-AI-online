/* Campus AI — Service Worker Registration */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(reg => {
                console.log('[SW] Registered. Scope:', reg.scope);

                // Prompt user when a new version is waiting
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available — optionally notify user
                            console.log('[SW] New version available. Refresh to update.');
                            // Uncomment to auto-update silently:
                            // newWorker.postMessage('skipWaiting');
                            // window.location.reload();
                        }
                    });
                });
            })
            .catch(err => console.warn('[SW] Registration failed:', err));
    });
}
