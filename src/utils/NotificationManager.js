
/**
 * Notification Manager
 * Handles browser push notifications and sound alerts
 */
class NotificationManager {
    constructor() {
        this.hasPermission = false;
        this.soundEnabled = true;
        this.audio = null;

        if (typeof window !== 'undefined') {
            // Preload sound (using a public clean notification sound)
            this.audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
            this.audio.volume = 0.5;

            this.checkPermission();
            this.setupUnlock();
        }
    }

    setupUnlock() {
        // Unlock audio context on first click
        const unlock = () => {
            if (this.audio) {
                this.audio.play().then(() => {
                    this.audio.pause();
                    this.audio.currentTime = 0;
                    console.log('Audio unlocked');
                }).catch(e => console.log('Audio unlock failed:', e));
            }
            window.removeEventListener('click', unlock);
            window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('click', unlock);
        window.addEventListener('touchstart', unlock);
    }

    async checkPermission() {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            this.hasPermission = true;
        }
    }

    async requestPermission() {
        if (!('Notification' in window)) return false;

        const permission = await Notification.requestPermission();
        this.hasPermission = permission === 'granted';
        return this.hasPermission;
    }

    notify(title, body, options = {}) {
        if (!this.hasPermission) return;

        // Don't show if window is focused
        if (document.hasFocus()) {
            this.playDing();
            return;
        }

        const notification = new Notification(title, {
            body,
            icon: '/logo192.png',
            ...options
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        this.playDing();
    }

    playDing() {
        if (!this.soundEnabled || !this.audio) {
            console.log('Sound disabled or audio not initialized');
            return;
        }

        // Reset and play
        this.audio.currentTime = 0;
        this.audio.play()
            .then(() => console.log('Sound played successfully'))
            .catch(e => console.warn('Sound blocked or failed:', e));
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }
}

export const notifications = new NotificationManager();
