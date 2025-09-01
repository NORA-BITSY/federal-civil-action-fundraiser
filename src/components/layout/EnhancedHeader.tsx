'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
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
  ChevronDown,
  Home,
  Users,
  HelpCircle,
  Gavel
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Browse Campaigns', href: '/campaigns', icon: Search },
  { name: 'How It Works', href: '/how-it-works', icon: HelpCircle },
  { name: 'Success Stories', href: '/success-stories', icon: Heart },
  { name: 'About', href: '/about', icon: Users },
  { name: 'Support', href: '/support', icon: HelpCircle },
]

const userMenuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My Campaigns', href: '/dashboard/campaigns', icon: Heart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Sign Out', href: '#', icon: LogOut, action: 'signOut' },
]

export function EnhancedHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
    setUserMenuOpen(false)
  }

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Navigate to search results
      window.location.href = `/campaigns?search=${encodeURIComponent(query)}`
    }
  }

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.25, 0.25, 0.75] }}
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
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <Scale className="h-8 w-8 text-blue-600 transition-all duration-200 group-hover:text-blue-700" />
                  <motion.div
                    className="absolute inset-0 bg-blue-600/20 rounded-full scale-0 group-hover:scale-110"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    Legal Defense Fund
                  </span>
                  <div className="text-xs text-gray-500 -mt-1">
                    Justice for All
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      'hover:bg-gray-100/80 hover:text-blue-600 hover:scale-105',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                      pathname === item.href
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700'
                    )}
                  >
                    {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <SearchInput
                placeholder="Search campaigns, legal cases..."
                onSearch={handleSearch}
                className="w-full"
              />
            </div>

            {/* Action Buttons & User Menu - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Notifications */}
              {session && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </motion.button>
              )}

              {/* Create Campaign Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/campaigns/create">
                  <Button size="sm" className="rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </Link>
              </motion.div>

              {/* User Menu */}
              {status === 'loading' ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              ) : session ? (
                <div ref={userMenuRef} className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-gray-400 transition-transform duration-200",
                      userMenuOpen && "rotate-180"
                    )} />
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.25, 0.25, 0.75] }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {session.user?.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.user?.email}
                          </p>
                        </div>
                        {userMenuItems.map((item, index) => (
                          <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            {item.action === 'signOut' ? (
                              <button
                                onClick={handleSignOut}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                              >
                                <item.icon className="w-4 h-4 mr-3" />
                                {item.name}
                              </button>
                            ) : (
                              <Link
                                href={item.href}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <item.icon className="w-4 h-4 mr-3" />
                                {item.name}
                              </Link>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="rounded-xl">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" className="rounded-xl">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.3, ease: [0.25, 0.25, 0.25, 0.75] }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Mobile header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2">
                    <Gavel className="h-6 w-6 text-blue-600" />
                    <span className="font-bold text-gray-900">Menu</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile search */}
                <div className="mb-6">
                  <SearchInput
                    placeholder="Search campaigns..."
                    onSearch={(query) => {
                      handleSearch(query)
                      setMobileMenuOpen(false)
                    }}
                  />
                </div>

                {/* Mobile navigation */}
                <nav className="space-y-1 mb-8">
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200',
                          'hover:bg-gray-100/80 hover:text-blue-600',
                          pathname === item.href
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-700'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Mobile user section */}
                {session ? (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {session.user?.name || 'User'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {userMenuItems.map((item, index) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (index + navigation.length) * 0.1 }}
                        >
                          {item.action === 'signOut' ? (
                            <button
                              onClick={handleSignOut}
                              className="flex items-center w-full px-4 py-3 text-left text-base text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors duration-150"
                            >
                              <item.icon className="w-5 h-5 mr-3" />
                              {item.name}
                            </button>
                          ) : (
                            <Link
                              href={item.href}
                              className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-150"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <item.icon className="w-5 h-5 mr-3" />
                              {item.name}
                            </Link>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-6 space-y-3">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="lg" className="w-full rounded-xl">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="lg" className="w-full rounded-xl">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}