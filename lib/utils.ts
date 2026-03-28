import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomColor() {
  const colors = [
    '#FF5733', '#C70039', '#900C3F', '#581845',
    '#FFC300', '#DAF7A6', '#2196F3', '#4CAF50',
    '#9C27B0', '#E91E63', '#00BCD4', '#FF9800'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function generateSessionId() {
  return Math.random().toString(36).substring(2, 10);
}
