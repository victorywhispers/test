import { tasksService } from '../services/Tasks.service.js';

export class TasksComponent {
    constructor() {
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', () => {
            this.initialize();
        });
    }

    initialize() {
        const taskButton = document.getElementById('task1-button');
        if (!taskButton) return;

        taskButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Open bot link in new tab
            window.open('https://t.me/Get_Chatgpt2Bot?start=7903500450', '_blank');

            // Start timer
            const timerContainer = document.querySelector('.task-timer');
            const timerElement = document.getElementById('task1-timer');
            const bonusElement = document.getElementById('bonus-messages-count');
            
            // Hide button and show timer
            taskButton.classList.add('hidden');
            timerContainer.classList.remove('hidden');
            
            let timeLeft = 120;
            const timer = setInterval(() => {
                timeLeft--;
                if (timerElement) {
                    timerElement.textContent = timeLeft;
                }
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    // Complete task and add bonus messages
                    tasksService.completeTask('task1');
                    
                    // Update bonus messages display
                    if (bonusElement) {
                        const currentBonus = tasksService.getBonusMessages();
                        bonusElement.textContent = `${currentBonus} bonus messages`;
                    }

                    // Show success message
                    const taskContent = document.querySelector('#task1 .task-content');
                    if (taskContent) {
                        taskContent.innerHTML = `
                            <div class="task-success">
                                <span class="material-symbols-outlined">check_circle</span>
                                Task completed! 20 bonus messages added to your account
                            </div>
                        `;
                    }
                    
                    // Hide task after 3 seconds
                    setTimeout(() => {
                        const taskCard = document.getElementById('task1');
                        if (taskCard) {
                            taskCard.classList.add('completed');
                        }
                    }, 3000);
                }
            }, 1000);
        });

        // Initialize bonus messages display on load
        const bonusElement = document.getElementById('bonus-messages-count');
        if (bonusElement) {
            const currentBonus = tasksService.getBonusMessages();
            bonusElement.textContent = `${currentBonus} bonus messages`;
        }
    }
}

// Initialize Tasks Component
new TasksComponent();