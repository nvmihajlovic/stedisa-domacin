/**
 * 🎨 Unified Color Theme System
 * 
 * Konzistentna paleta boja za celu aplikaciju.
 * Sve komponente koriste ove boje za uniforman izgled.
 */

export const theme = {
  // Expense colors (Pink/Purple gradient)
  expense: {
    gradient: 'linear-gradient(135deg, rgba(166, 77, 255, 0.3) 0%, rgba(255, 104, 194, 0.3) 100%)',
    gradientSolid: 'linear-gradient(135deg, #A64DFF 0%, #FF68C2 100%)',
    gradientBright: 'linear-gradient(135deg, rgba(166, 77, 255, 0.9) 0%, rgba(255, 104, 194, 0.9) 100%)',
    primary: '#FFB3E6',
    secondary: '#A64DFF',
    light: 'rgba(255, 179, 230, 0.15)',
    border: 'rgba(255, 107, 157, 0.3)',
    shadow: 'rgba(166, 77, 255, 0.4)',
    glow: '0 0 20px rgba(255, 107, 157, 0.3)'
  },
  
  // Income colors (Green/Teal gradient)
  income: {
    gradient: 'linear-gradient(135deg, rgba(40, 234, 138, 0.3) 0%, rgba(31, 184, 255, 0.3) 100%)',
    gradientSolid: 'linear-gradient(135deg, #28EA8A 0%, #1FB8FF 100%)',
    gradientBright: 'linear-gradient(135deg, rgba(40, 234, 138, 0.9) 0%, rgba(31, 184, 255, 0.9) 100%)',
    primary: '#6FFFC4',
    secondary: '#28EA8A',
    light: 'rgba(111, 255, 196, 0.15)',
    border: 'rgba(40, 234, 138, 0.3)',
    shadow: 'rgba(40, 234, 138, 0.4)',
    glow: '0 0 20px rgba(40, 234, 138, 0.3)'
  },
  
  // Neutral/UI colors
  neutral: {
    bg: 'linear-gradient(145deg, #1E1B2A, #171421)',
    bgLight: 'rgba(28, 26, 46, 0.6)',
    bgCard: 'rgba(20, 18, 38, 0.85)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderLight: 'rgba(255, 255, 255, 0.1)',
    text: '#E8E7F5',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    textLight: 'rgba(255, 255, 255, 0.4)'
  },
  
  // Accent colors (Purple/Blue for actions)
  accent: {
    gradient: 'linear-gradient(135deg, #9F70FF 0%, #4C8BEA 100%)',
    primary: '#9F70FF',
    secondary: '#4C8BEA',
    light: 'rgba(159, 112, 255, 0.15)',
    border: 'rgba(159, 112, 255, 0.3)'
  },
  
  // Status colors
  status: {
    success: {
      gradient: 'linear-gradient(135deg, #45D38A 0%, #2ECC71 100%)',
      primary: '#45D38A',
      light: 'rgba(69, 211, 138, 0.15)'
    },
    warning: {
      gradient: 'linear-gradient(135deg, #FFB84D 0%, #FF9F00 100%)',
      primary: '#FFB84D',
      light: 'rgba(255, 184, 77, 0.15)'
    },
    danger: {
      gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      primary: '#EF4444',
      light: 'rgba(239, 68, 68, 0.15)'
    },
    info: {
      gradient: 'linear-gradient(135deg, #4DB5FF 0%, #3B9FDB 100%)',
      primary: '#4DB5FF',
      light: 'rgba(77, 181, 255, 0.15)'
    }
  }
}

/**
 * Helper functions
 */
export const getExpenseColor = (opacity: number = 0.3) => 
  `linear-gradient(135deg, rgba(166, 77, 255, ${opacity}) 0%, rgba(255, 104, 194, ${opacity}) 100%)`

export const getIncomeColor = (opacity: number = 0.3) => 
  `linear-gradient(135deg, rgba(40, 234, 138, ${opacity}) 0%, rgba(31, 184, 255, ${opacity}) 100%)`

export const getExpenseShadow = (opacity: number = 0.4) =>
  `0 0 20px rgba(166, 77, 255, ${opacity})`

export const getIncomeShadow = (opacity: number = 0.4) =>
  `0 0 20px rgba(40, 234, 138, ${opacity})`
