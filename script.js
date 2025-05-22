document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.getElementById('game-board');
            const ctx = canvas.getContext('2d');
            const scoreDisplay = document.getElementById('score');
            const highScoreDisplay = document.getElementById('high-score');
            const finalScoreDisplay = document.getElementById('final-score');
            const gameOverScreen = document.getElementById('game-over');
            const startScreen = document.getElementById('start-screen');
            const startBtn = document.getElementById('start-btn');
            const restartBtn = document.getElementById('restart-btn');
            
            // Control buttons
            const upBtn = document.getElementById('up-btn');
            const downBtn = document.getElementById('down-btn');
            const leftBtn = document.getElementById('left-btn');
            const rightBtn = document.getElementById('right-btn');
            
            // Game settings
            const gridSize = 20;
            const tileCount = canvas.width / gridSize;
            let speed = 7;
            
            // Game state
            let snake = [];
            let food = {};
            let direction = 'right';
            let nextDirection = 'right';
            let score = 0;
            let highScore = localStorage.getItem('snakeHighScore') || 0;
            let gameRunning = false;
            let gameLoop;
            
            highScoreDisplay.textContent = highScore;
            
            // Initialize game
            function initGame() {
                snake = [
                    {x: 5, y: 10},
                    {x: 4, y: 10},
                    {x: 3, y: 10}
                ];
                
                direction = 'right';
                nextDirection = 'right';
                score = 0;
                scoreDisplay.textContent = score;
                
                placeFood();
                gameRunning = true;
            }
            
            // Place food at random position
            function placeFood() {
                food = {
                    x: Math.floor(Math.random() * tileCount),
                    y: Math.floor(Math.random() * tileCount)
                };
                
                // Make sure food doesn't spawn on snake
                for (let segment of snake) {
                    if (segment.x === food.x && segment.y === food.y) {
                        return placeFood();
                    }
                }
            }
            
            // Main game loop
            function gameUpdate() {
                // Move snake
                let head = {x: snake[0].x, y: snake[0].y};
                
                direction = nextDirection;
                
                switch(direction) {
                    case 'up':
                        head.y--;
                        break;
                    case 'down':
                        head.y++;
                        break;
                    case 'left':
                        head.x--;
                        break;
                    case 'right':
                        head.x++;
                        break;
                }
                
                // Check collision with walls
                if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
                    gameOver();
                    return;
                }
                
                // Check collision with self
                for (let segment of snake) {
                    if (segment.x === head.x && segment.y === head.y) {
                        gameOver();
                        return;
                    }
                }
                
                // Add new head
                snake.unshift(head);
                
                // Check if snake ate food
                if (head.x === food.x && head.y === food.y) {
                    score++;
                    scoreDisplay.textContent = score;
                    
                    // Increase speed every 5 points
                    if (score % 5 === 0) {
                        speed += 0.5;
                    }
                    
                    placeFood();
                } else {
                    // Remove tail if no food eaten
                    snake.pop();
                }
                
                // Draw everything
                draw();
            }
            
            // Draw game elements
            function draw() {
                // Clear canvas
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw grid lines
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 0.5;
                
                for (let i = 0; i < tileCount; i++) {
                    ctx.beginPath();
                    ctx.moveTo(i * gridSize, 0);
                    ctx.lineTo(i * gridSize, canvas.height);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.moveTo(0, i * gridSize);
                    ctx.lineTo(canvas.width, i * gridSize);
                    ctx.stroke();
                }
                
                // Draw snake
                ctx.fillStyle = '#4ade80';
                for (let segment of snake) {
                    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
                    
                    // Add pixel effect
                    ctx.strokeStyle = '#166534';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
                }
                
                // Draw head differently
                let head = snake[0];
                ctx.fillStyle = '#86efac';
                ctx.fillRect(head.x * gridSize, head.y * gridSize, gridSize, gridSize);
                
                // Draw food
                ctx.fillStyle = '#f87171';
                ctx.beginPath();
                ctx.arc(
                    food.x * gridSize + gridSize/2, 
                    food.y * gridSize + gridSize/2, 
                    gridSize/2 - 1, 
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
                
                // Food border
                ctx.strokeStyle = '#991b1b';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(
                    food.x * gridSize + gridSize/2, 
                    food.y * gridSize + gridSize/2, 
                    gridSize/2 - 1, 
                    0, 
                    Math.PI * 2
                );
                ctx.stroke();
            }
            
            // Game over
            function gameOver() {
                gameRunning = false;
                clearInterval(gameLoop);
                
                // Update high score
                if (score > highScore) {
                    highScore = score;
                    highScoreDisplay.textContent = highScore;
                    localStorage.setItem('snakeHighScore', highScore);
                }
                
                finalScoreDisplay.textContent = `SCORE: ${score}`;
                gameOverScreen.classList.remove('hidden');
                canvas.classList.add('game-over');
            }
            
            // Start game
            function startGame() {
                startScreen.classList.add('hidden');
                gameOverScreen.classList.add('hidden');
                canvas.classList.remove('game-over');
                
                initGame();
                draw();
                
                gameLoop = setInterval(gameUpdate, 1000 / speed);
            }
            
            // Event listeners
            startBtn.addEventListener('click', startGame);
            restartBtn.addEventListener('click', startGame);
            
            // Keyboard controls
            document.addEventListener('keydown', (e) => {
                if (!gameRunning) return;
                
                switch(e.key) {
                    case 'ArrowUp':
                        if (direction !== 'down') nextDirection = 'up';
                        break;
                    case 'ArrowDown':
                        if (direction !== 'up') nextDirection = 'down';
                        break;
                    case 'ArrowLeft':
                        if (direction !== 'right') nextDirection = 'left';
                        break;
                    case 'ArrowRight':
                        if (direction !== 'left') nextDirection = 'right';
                        break;
                }
            });
            
            // Button controls
            upBtn.addEventListener('click', () => {
                if (gameRunning && direction !== 'down') nextDirection = 'up';
            });
            
            downBtn.addEventListener('click', () => {
                if (gameRunning && direction !== 'up') nextDirection = 'down';
            });
            
            leftBtn.addEventListener('click', () => {
                if (gameRunning && direction !== 'right') nextDirection = 'left';
            });
            
            rightBtn.addEventListener('click', () => {
                if (gameRunning && direction !== 'left') nextDirection = 'right';
            });
            
            // Initial draw
            draw();
        });