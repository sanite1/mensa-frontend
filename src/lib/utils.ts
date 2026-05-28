import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString('en-NG')}`
}

export function formatNairaFromNaira(naira: number): string {
  return `₦${naira.toLocaleString('en-NG')}`
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100)
}

export function koboToNaira(kobo: number): number {
  return kobo / 100
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}…` : str
}
