// Simple LocalStorage Wrapper
class StorageManager {
      static getTasks() {
                try {
                              const tasks = localStorage.getItem('planner_tasks');
                              return tasks ? JSON.parse(tasks) : [];
                } catch (e) {
                              console.error("Storage error:", e);
                              return [];
                }
      }

    static saveTasks(tasks) {
              try {
                            localStorage.setItem('planner_tasks', JSON.stringify(tasks));
                            console.log("Tasks saved to localStorage:", tasks.length);
              } catch (e) {
                            console.error("Save error:", e);
              }
    }

    static getSettings() {
              return {
                            startHour: 9,
                            endHour: 17
              };
    }
}

class Scheduler {
      static generatePlan(tasks, settings) {
                if (!tasks.length) return [];
                const { startHour, endHour } = settings;
                let currentTime = new Date();
                currentTime.setHours(startHour, 0, 0, 0);
                const endLimit = new Date();
                endLimit.setHours(endHour, 0, 0, 0);
                const priorityScore = { high: 2, medium: 1, low: 0 };
                const sortedTasks = [...tasks].sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority]);
                const plan = [];
                sortedTasks.forEach(task => {
                              const taskDurationMs = parseInt(task.duration) * 60 * 1000;
                              const potentialEndTime = new Date(currentTime.getTime() + taskDurationMs);
                              if (potentialEndTime <= endLimit) {
                                                plan.push({
                                                                      ...task,
                                                                      startTime: new Date(currentTime),
                                                                      endTime: potentialEndTime
                                                });
                                                currentTime = new Date(potentialEndTime);
                              }
                });
                return plan;
      }
      static formatTime(date) {
                const d = new Date(date);
                return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
      }
}

const taskForm = document.getElementById('task-form');
const tasksListContainer = document.getElementById('tasks-list');
const timelineContainer = document.getElementById('timeline');
const generateButton = document.getElementById('generate-plan');
const clearButton = document.getElementById('clear-tasks');
const currentDateLabel = document.getElementById('current-date');

let tasks = StorageManager.getTasks();
const settings = StorageManager.getSettings();

const init = () => {
      if (currentDateLabel) {
                currentDateLabel.innerText = new Date().toLocaleDateString('pl-PL', { 
                                                                                       weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                });
      }
      renderTasksList();
      if (window.lucide) lucide.createIcons();
};

if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('task-name').value;
                const duration = document.getElementById('task-duration').value;
                const priority = document.getElementById('task-priority').value;
                if (!name || !duration) return;
                const newTask = {
                              id: Date.now(),
                              name: name,
                              duration: parseInt(duration),
                              priority: priority,
                };
                tasks.push(newTask);
                StorageManager.saveTasks(tasks);
                renderTasksList();
                taskForm.reset();
      });
}

if (generateButton) {
      generateButton.addEventListener('click', () => {
                const plan = Scheduler.generatePlan(tasks, settings);
                renderTimeline(plan);
      });
}

if (clearButton) {
      clearButton.addEventListener('click', () => {
                if (confirm('Czy na pewno chcesz usunac wszystkie zadania i zresetowac plan?')) {
                              tasks = [];
                              StorageManager.saveTasks(tasks);
                              renderTasksList();
                              renderTimeline([]);
                }
      });
}

function renderTasksList() {
      if (!tasksListContainer) return;
      if (tasks.length === 0) {
                tasksListContainer.innerHTML = '<p class="text-muted">Brak zadan w poczekalni.</p>';
                return;
      }
      tasksListContainer.innerHTML = tasks.map(task => `
              <div class="task-card">
                          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                          <h3 style="margin-bottom: 4px;">${task.name}</h3>
                                                          <button class="delete-task" data-id="${task.id}" title="Usun zadanie" style="color: var(--error-color); background: none; padding: 4px; font-size: 0.75rem; font-weight: 600;">USUN</button>
                                                                      </div>
                                                                                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                                                                                                  <span class="text-muted">${task.duration} min</span>
                                                                                                                  <span class="task-priority priority-${task.priority}">${task.priority}</span>
                                                                                                                              </div>
                                                                                                                                      </div>
                                                                                                                                          `).join('');
      document.querySelectorAll('.delete-task').forEach(btn => {
                btn.onclick = (e) => {
                              const id = parseInt(e.target.dataset.id);
                              tasks = tasks.filter(t => t.id !== id);
                              StorageManager.saveTasks(tasks);
                              renderTasksList();
                };
      });
      if (window.lucide) lucide.createIcons();
}

function renderTimeline(plan) {
      if (!timelineContainer) return;
      if (plan.length === 0) {
                timelineContainer.innerHTML = '<div style="text-align: center; padding: 3rem; background: white; border-radius: var(--radius-lg); border: 2px dashed #e2e8f0;"><p class="text-muted">Brak zadan pasujacych do planu lub pusty harmonogram.</p></div>';
                return;
      }
      timelineContainer.innerHTML = plan.map(item => `
              <div class="timeline-slot">
                          <div class="slot-time">${Scheduler.formatTime(item.startTime)}</div>
                                      <div class="slot-content">
                                                      <div class="task-card" style="border-left: 4px solid var(--accent-color);">
                                                                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                                                                                  <h3 style="font-size: 1.1rem;">${item.name}</h3>
                                                                                                                          <span style="font-size: 0.85rem; font-weight: 600; color: var(--accent-color); background: var(--accent-soft); padding: 4px 8px; border-radius: 4px;">
                                                                                                                                                      ${Scheduler.formatTime(item.startTime)} - ${Scheduler.formatTime(item.endTime)}
                                                                                                                                                                              </span>
                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                      <div style="display: flex; gap: 12px; align-items: center;">
                                                                                                                                                                                                                                               <span class="task-priority priority-${item.priority}">${item.priority}</span>
                                                                                                                                                                                                                                                                        <span class="text-muted">${item.duration} min</span>
                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                    `).join('');
      if (window.lucide) lucide.createIcons();
}
init();
