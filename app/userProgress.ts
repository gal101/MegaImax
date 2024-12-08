import { EventEmitter } from 'events';

const XP_PER_REPORT: number = 10;
const XP_MAX: number = 500;

interface UserProgress {
  xp: number;
  level: number;
}

const progressEvents = new EventEmitter();
let userProgress: UserProgress = {
  xp: 40,
  level: 1
};

export const getUserProgress = () => ({ ...userProgress });

export const addXP = () => {
  userProgress.xp += XP_PER_REPORT;
  
  while (userProgress.xp >= XP_MAX) {
    userProgress.xp -= XP_MAX;
    userProgress.level += 1;
  }
  
  progressEvents.emit('progressUpdated', getUserProgress());
  return userProgress;
};

export const addProgressListener = (callback: (progress: UserProgress) => void) => {
  const handler = (progress: UserProgress) => callback(progress);
  progressEvents.addListener('progressUpdated', handler);
  return () => progressEvents.removeListener('progressUpdated', handler);
};