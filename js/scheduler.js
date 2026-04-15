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
      const taskDurationMs = task.duration * 60 * 1000;
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
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  }
}
export default Scheduler;
