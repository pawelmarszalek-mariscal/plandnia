class StorageManager {
static getTasks() {
const tasks = localStorage.getItem('planner_tasks');
return tasks ? JSON.parse(tasks) : [];
}
static saveTasks(tasks) {
localStorage.setItem('planner_tasks', JSON.stringify(tasks));
}
static getSettings() {
const settings = localStorage.getItem('planner_settings');
return settings ? JSON.parse(settings) : {
startHour: 9,
endHour: 17
};
}
static saveSettings(settings) {
localStorage.setItem('planner_settings', JSON.stringify(settings));
}
}
export default StorageManager;
