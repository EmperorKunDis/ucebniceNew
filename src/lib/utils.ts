import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Bezpečně slučuje Tailwind CSS třídy pomocí clsx a tailwind-merge
 * @param inputs - Pole tříd, podmíněných tříd, nebo objektů s třídami
 * @returns Sloučený řetězec CSS tříd
 * 
 * @example
 * cn('px-4 py-2', 'bg-blue-500') // 'px-4 py-2 bg-blue-500'
 * cn('p-2', 'p-4') // 'p-4' (tailwind-merge inteligentně vyřeší konflikty)
 * cn({ 'bg-red-500': isError }, 'text-white') // podmíněné třídy
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generuje URL pro otevření Jupyter notebooku v Google Colab
 * @param user - GitHub username
 * @param repo - Název repozitáře
 * @param branch - Název větve (např. 'main')
 * @param notebookPath - Cesta k notebooku v repozitáři
 * @returns URL pro Google Colab
 * 
 * @example
 * generateColabUrl('martinsvanda', 'ucebnice-programovani', 'main', 'notebooks/lesson1.ipynb')
 * // 'https://colab.research.google.com/github/martinsvanda/ucebnice-programovani/blob/main/notebooks/lesson1.ipynb'
 */
export function generateColabUrl(
  user: string,
  repo: string,
  branch: string,
  notebookPath: string
): string {
  // Odstranit počáteční lomítko pokud existuje
  const cleanPath = notebookPath.startsWith('/') ? notebookPath.slice(1) : notebookPath;
  
  return `https://colab.research.google.com/github/${user}/${repo}/blob/${branch}/${cleanPath}`;
}