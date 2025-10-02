// Rocket Flapper Game Logic
class RocketFlapper {
    constructor() {
        this.gameCanvas = document.getElementById('gameCanvas');
        this.rocket = document.getElementById('rocket');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.finalScoreElement = document.getElementById('finalScore');
        this.phaseTimerElement = document.getElementById('phaseTimer');
        this.phaseResultElement = document.getElementById('phaseResult');
        this.gameOverTitle = document.getElementById('gameOverTitle');
        this.gameOverMessage = document.getElementById('gameOverMessage');
        
        // Game state
        this.isGameRunning = false;
        this.score = 0;
        this.highScore = localStorage.getItem('rocketFlapperHighScore') || 0;
        this.gameSpeed = 2;
        
        // Physics (lighter gravity for space!)
        this.rocketY = 200; // Middle of screen
        this.rocketVelocity = 0;
        this.gravity = 0.02; // Ultra light gravity for space feel
        this.flapPower = -4; // Strong flap power for responsive control
        
        // Game objects
        this.obstacles = [];
        this.dinosaurs = [];
        this.earth = null;
        this.lastObstacleTime = 0;
        this.lastDinosaurTime = 0;
        this.lastAsteroidTime = 0;
        this.obstacleInterval = 4000; // Much slower obstacle spawning
        this.dinosaurInterval = 3000; // Slower dinosaur spawning
        this.asteroidInterval = 3000; // Much less frequent asteroids
        this.asteroids = [];
        
        // Game phases
        this.gamePhase = 'hunt'; // Now we hunt dinosaurs first!
        this.gameStartTime = 0;
        this.dinosaursHit = 0;
        this.totalDinosaurs = 0;
        this.earthSpawned = false;
        this.gameWon = false;
        
        this.init();
    }
    
    init() {
        this.highScoreElement.textContent = this.highScore;
        this.bindEvents();
    }
    
    bindEvents() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        
        // Restart button
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        
        // Home button
        document.getElementById('homeBtn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        // Flap controls
        // Mouse controls - rocket follows mouse
        this.gameCanvas.addEventListener('mousemove', (e) => {
            if (this.isGameRunning) {
                const rect = this.gameCanvas.getBoundingClientRect();
                const mouseY = e.clientY - rect.top;
                this.rocketY = Math.max(25, Math.min(mouseY - 25, this.gameCanvas.offsetHeight - 75));
                this.updateRocketPosition();
            }
        });
        
        // Click to start game
        this.gameCanvas.addEventListener('click', (e) => {
            if (this.startScreen.style.display !== 'none') {
                this.startGame();
            }
        });
        
        // Enhanced touch support for mobile
        this.gameCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.startScreen.style.display !== 'none') {
                this.startGame();
            }
        }, { passive: false });
        
        // Touch move for rocket control
        this.gameCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.isGameRunning && e.touches.length > 0) {
                const rect = this.gameCanvas.getBoundingClientRect();
                const touchY = e.touches[0].clientY - rect.top;
                this.rocketY = Math.max(25, Math.min(touchY - 25, this.gameCanvas.offsetHeight - 75));
                this.updateRocketPosition();
            }
        }, { passive: false });
        
        this.gameCanvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, { passive: false });
        
        // Additional touch event for better mobile support
        this.gameCanvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.isGameRunning) {
                this.flap();
            }
        }, { passive: false });
        
        // Enhanced touch support for buttons
        document.getElementById('startBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startGame();
        }, { passive: false });
        
        document.getElementById('restartBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.restartGame();
        }, { passive: false });
        
        // Add touch support for home button
        const homeBtn = document.getElementById('homeBtn');
        if (homeBtn) {
            homeBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.close();
            }, { passive: false });
        }
    }
    
    startGame() {
        this.isGameRunning = true;
        this.score = 0;
        this.gameSpeed = 2;
        this.rocketY = 200;
        this.rocketVelocity = 0;
        
        // Clear all existing game objects from DOM
        this.clearAllGameObjects();
        
        this.obstacles = [];
        this.dinosaurs = [];
        this.asteroids = [];
        this.earth = null;
        this.gamePhase = 'hunt';
        this.gameStartTime = Date.now();
        this.lastObstacleTime = Date.now();
        this.lastDinosaurTime = Date.now();
        this.lastAsteroidTime = Date.now();
        this.dinosaursHit = 0;
        this.totalDinosaurs = 0;
        this.earthSpawned = false;
        this.gameWon = false;
        
        this.startScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.gameCanvas.classList.add('playing');
        
        this.scoreElement.textContent = this.score;
        this.phaseTimerElement.textContent = 'Hunt: 0/5 Dinosaurs';
        this.updateRocketPosition();
        this.gameLoop();
    }
    
    restartGame() {
        this.startGame();
    }
    
    clearAllGameObjects() {
        // Remove all obstacles
        this.obstacles.forEach(obstacle => {
            if (obstacle.element && obstacle.element.parentNode) {
                obstacle.element.remove();
            }
        });
        
        // Remove all dinosaurs
        this.dinosaurs.forEach(dinosaur => {
            if (dinosaur.element && dinosaur.element.parentNode) {
                dinosaur.element.remove();
            }
        });
        
        // Remove all asteroids
        this.asteroids.forEach(asteroid => {
            if (asteroid.element && asteroid.element.parentNode) {
                asteroid.element.remove();
            }
        });
        
        // Remove Earth if it exists
        if (this.earth && this.earth.element && this.earth.element.parentNode) {
            this.earth.element.remove();
        }
    }
    
    // Flap function removed - rocket now follows mouse/touch
    
    updatePhase() {
        // Update phase display
        if (this.gamePhase === 'hunt') {
            this.phaseTimerElement.textContent = `Hunt: ${this.dinosaursHit}/5 Dinosaurs`;
            
            // Check if we should spawn Earth
            if (this.dinosaursHit >= 5 && !this.earthSpawned) {
                this.spawnEarth();
                this.earthSpawned = true;
                this.phaseTimerElement.textContent = 'DESTROY EARTH!';
                this.phaseTimerElement.style.color = '#ff4444';
                
                // Stop spawning dinosaurs and obstacles
                this.obstacles.forEach(obstacle => obstacle.element.remove());
                this.dinosaurs.forEach(dinosaur => dinosaur.element.remove());
                this.asteroids.forEach(asteroid => asteroid.element.remove());
                this.obstacles = [];
                this.dinosaurs = [];
                this.asteroids = [];
            }
        }
    }
    
    spawnAsteroid() {
        if (this.earthSpawned) return; // Stop spawning when Earth appears
        
        const currentTime = Date.now();
        if (currentTime - this.lastAsteroidTime > this.asteroidInterval) {
            const asteroid = document.createElement('div');
            asteroid.className = 'asteroid-obstacle';
            
            const asteroidBody = document.createElement('div');
            asteroidBody.className = 'asteroid-obstacle-body';
            
            // Different asteroid types with varying sizes and speeds
            const asteroidTypes = [
                { emoji: '☄️', size: 35, speed: 1.2 },
                { emoji: '🪨', size: 40, speed: 1.0 },
                { emoji: '🌑', size: 45, speed: 0.8 },
                { emoji: '⚫', size: 30, speed: 1.5 },
                { emoji: '🌚', size: 50, speed: 0.6 }
            ];
            
            const asteroidType = asteroidTypes[Math.floor(Math.random() * asteroidTypes.length)];
            asteroidBody.textContent = asteroidType.emoji;
            asteroidBody.style.fontSize = asteroidType.size + 'px';
            
            asteroid.appendChild(asteroidBody);
            const asteroidY = Math.random() * (this.gameCanvas.offsetHeight - 120) + 60;
            asteroid.style.top = asteroidY + 'px';
            this.gameCanvas.appendChild(asteroid);
            
            this.asteroids.push({
                element: asteroid,
                x: this.gameCanvas.offsetWidth + 60,
                y: asteroidY,
                speed: asteroidType.speed
            });
            
            this.lastAsteroidTime = currentTime;
            
            // Increase difficulty over time - spawn faster
            if (this.asteroidInterval > 800) {
                this.asteroidInterval -= 50;
            }
        }
    }
    
    spawnObstacle() {
        if (this.earthSpawned) return; // Stop spawning when Earth appears
        
        const currentTime = Date.now();
        if (currentTime - this.lastObstacleTime > this.obstacleInterval) {
            const obstacle = document.createElement('div');
            obstacle.className = 'obstacle';
            
            const obstacleBody = document.createElement('div');
            obstacleBody.className = 'obstacle-body';
            const planets = ['🪐', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔'];
            obstacleBody.textContent = planets[Math.floor(Math.random() * planets.length)];
            
            obstacle.appendChild(obstacleBody);
            const obstacleY = Math.random() * (this.gameCanvas.offsetHeight - 120) + 60;
            obstacle.style.top = obstacleY + 'px';
            this.gameCanvas.appendChild(obstacle);
            
            this.obstacles.push({
                element: obstacle,
                x: this.gameCanvas.offsetWidth + 60,
                y: obstacleY
            });
            
            this.lastObstacleTime = currentTime;
            
            // Gradually increase difficulty
            if (this.obstacleInterval > 2000) {
                this.obstacleInterval -= 100;
            }
        }
    }
    
    spawnDinosaur() {
        if (this.earthSpawned || this.dinosaursHit >= 5) return; // Stop spawning when Earth appears
        
        const currentTime = Date.now();
        if (currentTime - this.lastDinosaurTime > this.dinosaurInterval) {
            const dinosaur = document.createElement('div');
            dinosaur.className = 'dinosaur-target';
            
            const dinosaurBody = document.createElement('div');
            dinosaurBody.className = 'dinosaur-body';
            const dinosaurs = ['🦕', '🦖', '🐉'];
            dinosaurBody.textContent = dinosaurs[Math.floor(Math.random() * dinosaurs.length)];
            
            dinosaur.appendChild(dinosaurBody);
            const dinosaurY = Math.random() * (this.gameCanvas.offsetHeight - 120) + 60;
            dinosaur.style.top = dinosaurY + 'px';
            this.gameCanvas.appendChild(dinosaur);
            
            this.dinosaurs.push({
                element: dinosaur,
                x: this.gameCanvas.offsetWidth + 60,
                y: dinosaurY,
                hit: false
            });
            
            this.totalDinosaurs++;
            this.lastDinosaurTime = currentTime;
        }
    }
    
    spawnEarth() {
        const earth = document.createElement('div');
        earth.className = 'earth-target';
        
        const earthBody = document.createElement('div');
        earthBody.className = 'earth-body';
        earthBody.textContent = '🌍';
        
        earth.appendChild(earthBody);
        const earthY = this.gameCanvas.offsetHeight / 2 - 40;
        earth.style.top = earthY + 'px'; // Center vertically
        this.gameCanvas.appendChild(earth);
        
        this.earth = {
            element: earth,
            x: this.gameCanvas.offsetWidth + 80,
            y: earthY,
            hit: false
        };
    }
    
    updatePhysics() {
        // Rocket now follows mouse/touch, no physics needed
        // Keep rocket in bounds
        this.rocketY = Math.max(25, Math.min(this.rocketY, this.gameCanvas.offsetHeight - 75));
        this.updateRocketPosition();
    }
    
    updateRocketPosition() {
        this.rocket.style.top = this.rocketY + 'px';
    }
    
    updateObstacles() {
        this.obstacles.forEach((obstacle, index) => {
            obstacle.x -= this.gameSpeed;
            obstacle.element.style.right = (this.gameCanvas.offsetWidth - obstacle.x) + 'px';
            
            // Remove obstacles that are off screen
            if (obstacle.x < -60) {
                obstacle.element.remove();
                this.obstacles.splice(index, 1);
                this.updateScore(10);
            }
        });
    }
    
    updateAsteroids() {
        this.asteroids.forEach((asteroid, index) => {
            asteroid.x -= this.gameSpeed * asteroid.speed;
            asteroid.element.style.right = (this.gameCanvas.offsetWidth - asteroid.x) + 'px';
            
            // Remove asteroids that have gone off screen
            if (asteroid.x < -100) {
                asteroid.element.remove();
                this.asteroids.splice(index, 1);
            }
        });
    }
    
    updateDinosaurs() {
        this.dinosaurs.forEach((dinosaur, index) => {
            if (!dinosaur.hit) {
                dinosaur.x -= this.gameSpeed;
                dinosaur.element.style.right = (this.gameCanvas.offsetWidth - dinosaur.x) + 'px';
                
                // Remove dinosaurs that are off screen
                if (dinosaur.x < -60) {
                    dinosaur.element.remove();
                    this.dinosaurs.splice(index, 1);
                }
            }
        });
    }
    
    updateEarth() {
        if (this.earth && !this.earth.hit) {
            this.earth.x -= this.gameSpeed * 0.5; // Earth moves slower for dramatic effect
            this.earth.element.style.right = (this.gameCanvas.offsetWidth - this.earth.x) + 'px';
            
            // Remove Earth if it goes off screen (game over - missed opportunity)
            if (this.earth.x < -80) {
                this.earth.element.remove();
                this.earth = null;
                this.gameOver('missed_earth');
            }
        }
    }
    
    checkCollisions() {
        const rocketX = this.gameCanvas.offsetWidth / 2; // Rocket is centered horizontally
        const rocketY = this.rocketY;
        const rocketSize = 40; // Rocket collision size
        
        // Check obstacle collisions (game over)
        this.obstacles.forEach(obstacle => {
            if (this.isColliding(rocketX, rocketY, rocketSize, obstacle.x, obstacle.y, 60)) {
                this.gameOver('obstacle');
            }
        });
        
        // Check asteroid collisions (game over)
        this.asteroids.forEach(asteroid => {
            if (this.isColliding(rocketX, rocketY, rocketSize, asteroid.x, asteroid.y, 50)) {
                this.gameOver('asteroid');
            }
        });
        
        // Check dinosaur collisions (score points)
        this.dinosaurs.forEach(dinosaur => {
            if (!dinosaur.hit) {
                if (this.isColliding(rocketX, rocketY, rocketSize, dinosaur.x, dinosaur.y, 50)) {
                    dinosaur.hit = true;
                    dinosaur.element.classList.add('hit');
                    this.dinosaursHit++;
                    this.updateScore(50);
                    
                    setTimeout(() => {
                        dinosaur.element.remove();
                    }, 500);
                }
            }
        });
        
        // Check Earth collision (WIN THE GAME!)
        if (this.earth && !this.earth.hit) {
            if (this.isColliding(rocketX, rocketY, rocketSize, this.earth.x, this.earth.y, 80)) {
                this.earth.hit = true;
                this.earth.element.classList.add('hit');
                this.updateScore(1000); // HUGE score for destroying Earth!
                this.createExplosion(this.earth.element);
                this.gameWon = true;
                
                // Remove Earth after explosion
                setTimeout(() => {
                    if (this.earth && this.earth.element) {
                        this.earth.element.remove();
                        this.earth = null;
                    }
                }, 800); // Remove Earth during explosion
                
                setTimeout(() => {
                    this.gameOver('earth_destroyed');
                }, 1500); // Let explosion play out
            }
        }
    }
    
    isColliding(x1, y1, size1, x2, y2, size2) {
        const distance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
        return distance < (size1 + size2) / 2;
    }
    
    updateScore(points) {
        this.score += points;
        this.scoreElement.textContent = this.score;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            localStorage.setItem('rocketFlapperHighScore', this.highScore);
        }
    }
    
    createExplosion(element) {
        const rect = element.getBoundingClientRect();
        const gameRect = this.gameCanvas.getBoundingClientRect();
        
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = (rect.left - gameRect.left - 60) + 'px';
        explosion.style.top = (rect.top - gameRect.top - 60) + 'px';
        
        this.gameCanvas.appendChild(explosion);
        
        setTimeout(() => {
            explosion.remove();
        }, 1500);
    }
    
    gameOver(reason) {
        this.isGameRunning = false;
        this.gameCanvas.classList.remove('playing');
        
        // Clean up game objects
        this.obstacles.forEach(obstacle => obstacle.element.remove());
        this.dinosaurs.forEach(dinosaur => dinosaur.element.remove());
        if (this.earth && this.earth.element) {
            // Don't remove Earth if it was destroyed (let explosion finish)
            if (!this.earth.hit) {
                this.earth.element.remove();
            }
        }
        this.obstacles = [];
        this.dinosaurs = [];
        
        // Show game over screen with appropriate message
        this.finalScoreElement.textContent = this.score;
        
        if (reason === 'obstacle') {
            this.gameOverTitle.textContent = '🚀 Rocket Crashed! 💥';
            this.gameOverMessage.textContent = 'You hit a planet!';
        } else if (reason === 'asteroid') {
            this.gameOverTitle.textContent = '🚀 Asteroid Impact! 💥';
            this.gameOverMessage.textContent = 'You collided with an asteroid!';
        } else if (reason === 'earth_destroyed') {
            this.gameOverTitle.textContent = '🌍 EARTH DESTROYED! 💥';
            this.gameOverMessage.textContent = 'You are the ultimate asteroid! Planet Earth is no more!';
        } else if (reason === 'missed_earth') {
            this.gameOverTitle.textContent = '🌍 Earth Escaped! 😢';
            this.gameOverMessage.textContent = 'You missed your chance to destroy Earth!';
        }
        
        // Show phase results
        const targetDinosaurs = 5;
        let resultText = `<p>Dinosaurs Hit: ${this.dinosaursHit}/${targetDinosaurs}</p>`;
        
        if (this.gameWon) {
            resultText += '<p style="color: #ff4444; font-weight: bold;">🏆 EARTH DESTROYER! 🏆</p>';
        } else if (this.dinosaursHit >= 5) {
            resultText += '<p style="color: #64b5f6;">Earth appeared but escaped!</p>';
        }
        
        this.phaseResultElement.innerHTML = resultText;
        this.gameOverScreen.style.display = 'block';
        
        // Reset phase timer color
        this.phaseTimerElement.style.color = '#64b5f6';
    }
    
    gameLoop() {
        if (!this.isGameRunning) return;
        
        this.updatePhase();
        this.updatePhysics();
        this.spawnObstacle();
        this.spawnDinosaur();
        this.spawnAsteroid();
        this.updateObstacles();
        this.updateAsteroids();
        this.updateDinosaurs();
        this.updateEarth();
        this.checkCollisions();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new RocketFlapper();
});

// Sound effects (optional)
class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.init();
    }
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    playFlap() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    playHit() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
}

const soundEffects = new SoundEffects();

// Override methods to add sound
const originalFlap = AsteroidFlapper.prototype.flap;
AsteroidFlapper.prototype.flap = function() {
    originalFlap.call(this);
    soundEffects.playFlap();
};

const originalUpdateScore = AsteroidFlapper.prototype.updateScore;
AsteroidFlapper.prototype.updateScore = function(points) {
    originalUpdateScore.call(this, points);
    if (points >= 50) { // Dinosaur hit
        soundEffects.playHit();
    }
};