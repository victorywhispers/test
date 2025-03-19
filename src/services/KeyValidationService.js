import { chatLimitService } from './ChatLimitService.js';
import { db } from './Db.service.js';

class KeyValidationService {
    constructor() {
        this.STORAGE_KEY = 'wormgpt_access_key';
        // Update BASE_URL to match your service name in render.yaml
        this.BASE_URL = process.env.NODE_ENV === 'production' 
            ? 'https://wormgpt-api.onrender.com'  // Production URL
            : 'http://localhost:5000';  // Local development URL
    }

    validateKeyFormat(key) {
        const keyPattern = /^WR-[A-Z0-9]{10}$/;
        return keyPattern.test(key.toUpperCase());
    }

    async validateKey(key) {
        try {
            if (!this.validateKeyFormat(key)) {
                return { 
                    valid: false, 
                    message: 'Invalid key format. Key should start with WR- followed by 10 characters' 
                };
            }

            console.log('Validating key with server:', key);
            console.log('Using API URL:', this.BASE_URL);
            
            const response = await fetch(`${this.BASE_URL}/validate-key`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ key: key.toUpperCase() })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Server response:', data);
            
            if (data.valid) {
                const keyData = {
                    key: key.toUpperCase(),
                    expiryTime: data.expiryTime,
                    activatedAt: new Date().toISOString()
                };
                await this.saveKeyToDatabase(keyData);
            }
            
            return data;
        } catch (error) {
            console.error('Key validation error:', error);
            return { 
                valid: false, 
                message: error.message.includes('Failed to fetch') 
                    ? 'Cannot reach validation server. Please check your internet connection.'
                    : `Validation error: ${error.message}`
            };
        }
    }

    async saveKeyToDatabase(keyData) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keyData));
            return true;
        } catch (error) {
            console.error('Failed to save key to storage:', error);
            return false;
        }
    }

    async getKeyData() {
        try {
            const keyData = localStorage.getItem(this.STORAGE_KEY);
            return keyData ? JSON.parse(keyData) : null;
        } catch (error) {
            console.error('Failed to get key data:', error);
            return null;
        }
    }

    async isKeyValid() {
        try {
            const keyData = await this.getKeyData();
            if (!keyData) return false;

            const now = new Date();
            const expiryTime = new Date(keyData.expiryTime);
            return now < expiryTime;
        } catch (error) {
            console.error('Error checking key validity:', error);
            return false;
        }
    }

    async getRemainingTime() {
        const keyData = await this.getKeyData();
        if (!keyData) return null;

        const now = new Date();
        const expiryTime = new Date(keyData.expiryTime);
        const diff = expiryTime - now;

        return {
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        };
    }
}

export const keyValidationService = new KeyValidationService();