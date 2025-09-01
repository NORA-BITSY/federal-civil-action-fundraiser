'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { 
  Menu, 
  X, 
  Scale, 
  User,
  Heart,
  Plus,
  Search,
  Settings,
  LogOut,
  Bell,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Browse Campaigns', href: '/campaigns', icon: Search },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Success Stories', href: '/success-stories', icon: Heart },
  { name: 'About', href: '/about' },
  { name: 'Support', href: '/support' },
]

const userMenuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: User },
  { name: 'My Campaigns', href: '/dashboard/campaigns', icon: Heart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Sign Out', href: '#', icon: LogOut, action: 'signOut' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
    setUserMenuOpen(false)
  }

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50" 
          : "bg-white shadow-sm border-b border-gray-200"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Scale className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                Legal Defense Fund
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-blue-600',
                  pathname === item.href
                    ? 'text-blue-600'
                    : 'text-gray-700'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search campaigns..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Action Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/campaigns">
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Donate
              </Button>
            </Link>
            
            <Link href="/campaign/create">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Start Campaign
              </Button>
            </Link>

            {/* User Menu */}
            <div className="relative">
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-6 space-y-6 bg-white shadow-lg">
            {/* Mobile Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search campaigns..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block text-base font-medium transition-colors',
                    pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Action Buttons */}
            <div className="space-y-4">
              <Link href="/campaigns" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" fullWidth>
                  <Heart className="w-4 h-4 mr-2" />
                  Browse & Donate
                </Button>
              </Link>
              
              <Link href="/campaign/create" onClick={() => setMobileMenuOpen(false)}>
                <Button fullWidth>
                  <Plus className="w-4 h-4 mr-2" />
                  Start Campaign
                </Button>
              </Link>

              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" fullWidth>
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}