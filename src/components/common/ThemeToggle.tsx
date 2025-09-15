import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export default function ThemeToggle() {
  const { actualTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
      aria-label={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {actualTheme === 'dark' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  )
}