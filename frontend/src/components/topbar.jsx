import { useTheme } from '@/lib/theme'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/button'
import { Sun, Moon, Bell, User, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const Topbar = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme()
  const { usuario, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter:blur(10px)]:bg-background/60">
      <div className="container flex h-16 items-center gap-4 px-4 sm:px-8 md:px-12">
        <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" onClick={onToggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">SaPyme</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Beta
            </span>
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">{usuario?.nombre}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Topbar
