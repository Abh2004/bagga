import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUniqueLink(): string {
  return `${window.location.origin}/create/${Math.random().toString(36).substr(2, 9)}`
}

export const isLinkValid = (link: string): boolean => {
  // Example logic to validate the link
  return link.startsWith('https://');
};


export function saveFolder(name: string, photos: string[]) {
  const folders = JSON.parse(localStorage.getItem('folders') || '{}')
  folders[name] = photos
  localStorage.setItem('folders', JSON.stringify(folders))
}

export function getFolders(): Record<string, string[]> {
  return JSON.parse(localStorage.getItem('folders') || '{}')
}

