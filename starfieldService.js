// src/services/starfieldService.js

/**
 * A highly performant and robust service to render a parallax starfield animation.
 * This implementation is meticulously optimized to prevent browser crashes by using
 * batched rendering, efficient animation loops, and strict resource management.
 * It's theme-aware and introduces subtle visual effects for a premium feel.
 */
class StarfieldService {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.starsByColor = {}; // For batched rendering
        this.animationFrameId = null;
        this.resizeTimeout = null;
        
        // --- CONFIGURATION ---
        this.config = {
            // Cap the number of stars to ensure performance on all devices.
            MAX_STARS: 1500,
            // Lower number = higher density.
            DENSITY_FACTOR: 7000,
            // Stars per layer for parallax effect (60% slow, 30% medium, 10% fast)
            LAYER_DISTRIBUTION: [0.6, 0.3, 0.1],
            // Defines speed and size for each parallax layer.
            LAYERS: [
                { minSpeed: 0.1, maxSpeed: 0.4, minRadius: 0.4, maxRadius: 0.8 }, // Slow, small
                { minSpeed: 0.4, maxSpeed: 0.8, minRadius: 0.6, maxRadius: 1.2 }, // Medium
                { minSpeed: 0.8, maxSpeed: 1.2, minRadius: 1.0, maxRadius: 1.5 }, // Fast
            ],
            // Twinkling effect settings
            TWINKLE_CHANCE: 0.001,
            TWINKLE_SPEED: 0.05,
        };
        
        // This will be populated with colors from CSS variables
        this.themeColors = [];
    }

    /**
     * Initializes the service and starts the animation.
     * @param {string} canvasId - The ID of the canvas element.
     */
    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`[StarfieldService] Canvas element "${canvasId}" not found.`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');

        // Bind for proper `this` context in event listeners and loops
        this.boundAnimate = this.animate.bind(this);
        this.boundHandleResize = this.handleResize.bind(this);

        window.addEventListener('resize', this.boundHandleResize);
        
        // Initial setup and start
        this.setupCanvas();
        this.boundAnimate();
    }

    /**
     * Sets canvas dimensions and creates the starfield.
     */
    setupCanvas() {
        if (!this.canvas || !this.ctx) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.getThemeColors();
        this.createStars();
    }
    
    /**
     * Reads star colors directly from the CSS variables for theme compatibility.
     */
    getThemeColors() {
        const styles = getComputedStyle(document.body);
        this.themeColors = [
            styles.getPropertyValue('--stars-color-1').trim() || '#ffffff',
            styles.getPropertyValue('--stars-color-2').trim() || '#1affc8',
            styles.getPropertyValue('--stars-color-3').trim() || '#f31aff',
        ];
    }

    /**
     * Creates star objects and groups them by color for optimized rendering.
     */
    createStars() {
        this.starsByColor = {};
        this.themeColors.forEach(color => this.starsByColor[color] = []);
        
        const numStars = Math.min(
            this.config.MAX_STARS,
            Math.floor((this.canvas.width * this.canvas.height) / this.config.DENSITY_FACTOR)
        );

        this.config.LAYER_DISTRIBUTION.forEach((percentage, i) => {
            const layerConfig = this.config.LAYERS[i];
            const layerStarCount = Math.floor(numStars * percentage);

            for (let j = 0; j < layerStarCount; j++) {
                const star = this.generateStar(layerConfig);
                this.starsByColor[star.color].push(star);
            }
        });
    }

    /**
     * Generates a single star object with random properties.
     */
    generateStar(layerConfig) {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            speed: Math.random() * (layerConfig.maxSpeed - layerConfig.minSpeed) + layerConfig.minSpeed,
            radius: Math.random() * (layerConfig.maxRadius - layerConfig.minRadius) + layerConfig.minRadius,
            color: this.themeColors[Math.floor(Math.random() * this.themeColors.length)],
            alpha: Math.random() * 0.5 + 0.5, // Start with some variation
            alphaChangeDir: Math.random() > 0.5 ? 1 : -1
        };
    }
    
    /**
     * The main animation loop.
     */
    animate() {
        this.update();
        this.draw();
        this.animationFrameId = requestAnimationFrame(this.boundAnimate);
    }
    
    /**
     * Updates star positions and visual properties.
     */
    update() {
        for (const color in this.starsByColor) {
            for (const star of this.starsByColor[color]) {
                star.y -= star.speed;

                // Reset star to the bottom if it goes off-screen
                if (star.y < -star.radius) {
                    star.y = this.canvas.height + star.radius;
                    star.x = Math.random() * this.canvas.width;
                }

                // Add a subtle twinkling effect
                if (Math.random() < this.config.TWINKLE_CHANCE) {
                    star.alpha += this.config.TWINKLE_SPEED * star.alphaChangeDir;
                    if (star.alpha >= 1 || star.alpha <= 0.3) {
                        star.alphaChangeDir *= -1;
                    }
                }
            }
        }
    }

    /**
     * Draws all stars to the canvas in batches by color.
     */
    draw() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Iterate over each color group to render in batches
        for (const color in this.starsByColor) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const star of this.starsByColor[color]) {
                this.ctx.moveTo(star.x, star.y);
                this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
    }

    /**
     * Debounces resize events to avoid performance hiccups.
     */
    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => this.setupCanvas(), 250);
    }

    /**
     * Stops the animation and cleans up resources.
     */
    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        window.removeEventListener('resize', this.boundHandleResize);
        this.canvas = null;
        this.ctx = null;
        this.starsByColor = {};
    }
}

// Export a singleton instance to be used throughout the application.
export const starfieldService = new StarfieldService();
