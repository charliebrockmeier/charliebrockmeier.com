// Charlie's Pet Rock Game
class PetRockGame {
    constructor() {
        this.petRock = document.getElementById('petRock');
        this.rockFace = document.getElementById('rockFace');
        this.rockMouth = document.getElementById('rockMouth');
        this.rockBody = document.getElementById('rockBody');
        this.happinessMeter = document.getElementById('happinessMeter');
        this.happinessText = document.getElementById('happinessText');
        
        // Game state
        this.happiness = 100;
        this.lastPetTime = Date.now();
        this.mood = 'happy';
        this.petCount = 0;
        
        // Mood thresholds - much more sensitive
        this.sadThreshold = 60;
        this.angryThreshold = 30;
        this.deathThreshold = 0;
        
        // Set initial face - no text content needed for CSS face
        
        // Messages for different moods
        this.messages = {
            happy: [
                "Rocky is so happy! 🪨😊",
                "Rocky loves the attention! 🪨💕",
                "Rocky is feeling great! 🪨✨",
                "Rocky is content! 🪨😌"
            ],
            sad: [
                "Rocky is feeling lonely... 🪨😢",
                "Rocky needs more love! 🪨💔",
                "Rocky is getting sad... 🪨😞",
                "Rocky misses you! 🪨😭"
            ],
            angry: [
                "Rocky is ANGRY! 🪨😠",
                "Rocky is FURIOUS! 🪨🤬",
                "Rocky is MAD! 🪨😡",
                "Rocky is about to EXPLODE! 🪨💥"
            ],
            excited: [
                "Rocky is EXCITED! 🪨🤩",
                "Rocky is THRILLED! 🪨🎉",
                "Rocky is ECSTATIC! 🪨✨",
                "Rocky is OVER THE MOON! 🪨🌙"
            ],
            dead: [
                "Rocky has died from neglect... 💀",
                "Rocky is no more... RIP 🪨💀",
                "You killed Rocky! 💀",
                "Rocky is dead! You monster! 💀"
            ]
        };
        
        this.init();
    }
    
    init() {
        // Set up click event for petting
        this.petRock.addEventListener('click', () => this.petRock());
        
        // Start the happiness decay
        this.startHappinessDecay();
        
        // Update display
        this.updateDisplay();
        
        // Show welcome message
        this.showMessage("Welcome to Charlie's Pet Rock! Take care of Rocky! 🪨");
    }
    
    petRock() {
        // Don't pet if dead
        if (this.mood === 'dead') {
            this.showMessage("Rocky is dead! You can't pet a dead rock! 💀");
            return;
        }
        
        // Increase happiness more significantly
        this.happiness = Math.min(100, this.happiness + 30);
        this.lastPetTime = Date.now();
        this.petCount++;
        
        // Show petting animation
        this.showPettingAnimation();
        
        // Update mood
        this.updateMood();
        
        // Show random message
        this.showRandomMessage();
        
        // Update display
        this.updateDisplay();
        
        console.log('Rocky petted! Happiness:', this.happiness); // Debug
    }
    
    showPettingAnimation() {
        // Add excited class temporarily
        this.petRock.classList.add('excited');
        
        // Remove other mood classes
        this.petRock.classList.remove('sad', 'angry', 'happy');
        
        // Remove excited class after animation
        setTimeout(() => {
            this.petRock.classList.remove('excited');
            this.updateMood();
        }, 1000);
    }
    
    updateMood() {
        // Remove all mood classes
        this.petRock.classList.remove('sad', 'angry', 'happy', 'excited', 'dead');
        
        // Determine mood based on happiness
        if (this.happiness <= this.deathThreshold) {
            this.mood = 'dead';
            this.petRock.classList.add('dead');
        } else if (this.happiness <= this.angryThreshold) {
            this.mood = 'angry';
            this.petRock.classList.add('angry');
        } else if (this.happiness <= this.sadThreshold) {
            this.mood = 'sad';
            this.petRock.classList.add('sad');
        } else {
            this.mood = 'happy';
            this.petRock.classList.add('happy');
        }
    }
    
    startHappinessDecay() {
        setInterval(() => {
            // Decrease happiness over time - ULTRA fast decay
            const timeSinceLastPet = Date.now() - this.lastPetTime;
            const decayRate = Math.min(8, timeSinceLastPet / 2000); // ULTRA fast decay if not petted recently
            
            this.happiness = Math.max(0, this.happiness - decayRate);
            
            console.log('Happiness decay:', decayRate, 'New happiness:', this.happiness); // Debug
            
            // Update mood and display
            this.updateMood();
            this.updateDisplay();
            
            // Show warning messages
            if (this.happiness <= this.deathThreshold && this.mood === 'dead') {
                this.showMessage("💀 Rocky has died! Click the restart button to bring him back! 💀");
                this.showRestartButton();
            } else if (this.happiness <= this.angryThreshold && this.mood === 'angry') {
                this.showMessage("⚠️ Rocky is getting VERY angry! Pet him NOW! 🪨😠");
            } else if (this.happiness <= this.sadThreshold && this.mood === 'sad') {
                this.showMessage("💔 Rocky is getting sad... please pet him! 🪨😢");
            }
        }, 1000);
    }
    
    updateDisplay() {
        // Update happiness meter
        this.happinessMeter.style.width = this.happiness + '%';
        
        // Update happiness text
        let text = '';
        if (this.happiness >= 80) {
            text = 'Ecstatic!';
        } else if (this.happiness >= 60) {
            text = 'Happy!';
        } else if (this.happiness >= 40) {
            text = 'Okay';
        } else if (this.happiness >= 20) {
            text = 'Sad';
        } else if (this.happiness >= 10) {
            text = 'Very Sad';
        } else {
            text = 'FURIOUS!';
        }
        
        this.happinessText.textContent = text;
        
        // Update meter color based on happiness
        if (this.happiness >= 60) {
            this.happinessMeter.style.background = 'linear-gradient(90deg, #44ff44, #88ff88)';
        } else if (this.happiness >= 30) {
            this.happinessMeter.style.background = 'linear-gradient(90deg, #ffaa44, #ffcc66)';
        } else {
            this.happinessMeter.style.background = 'linear-gradient(90deg, #ff4444, #ff6666)';
        }
    }
    
    showRandomMessage() {
        const messages = this.messages[this.mood];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.showMessage(randomMessage);
    }
    
    showMessage(message) {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = 'rock-message';
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-size: 1.1rem;
            font-weight: bold;
            z-index: 1000;
            animation: messageSlide 3s ease-in-out forwards;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(messageEl);
        
        // Remove message after animation
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }
    
    showRestartButton() {
        // Create restart button
        const restartBtn = document.createElement('button');
        restartBtn.textContent = '🔄 Restart Rocky';
        restartBtn.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 1.2rem;
            font-weight: bold;
            cursor: pointer;
            z-index: 1001;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            animation: pulse 1s ease-in-out infinite;
        `;
        
        restartBtn.addEventListener('click', () => {
            this.restartRocky();
            restartBtn.remove();
        });
        
        document.body.appendChild(restartBtn);
    }
    
    restartRocky() {
        // Reset Rocky to full health
        this.happiness = 100;
        this.lastPetTime = Date.now();
        this.petCount = 0;
        this.mood = 'happy';
        
        // Remove death class
        this.petRock.classList.remove('dead');
        
        // Update display
        this.updateMood();
        this.updateDisplay();
        
        this.showMessage("Rocky is back from the dead! 🪨👻");
    }
}

// Add CSS for message animation
const style = document.createElement('style');
style.textContent = `
    @keyframes messageSlide {
        0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        20% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        80% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new PetRockGame();
});
