'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { AnimatedWrapper, StaggeredList, StaggeredItem } from '@/components/ui/AnimatedWrapper'
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  TrendingUp,
  Clock,
  ChevronDown,
  X,
  Plus,
  ArrowRight,
  Heart,
  Scale,
  Briefcase,
  Home,
  Globe,
  Users2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data - in real app, this would come from your API
const mockCampaigns = [
  {
    id: '1',
    title: 'Housing Discrimination Case - Johnson Family',
    description: 'Supporting the Johnson family in their fight against discriminatory housing practices that prevented them from securing safe housing.',
    category: 'Housing Rights',
    location: 'Oakland, CA',
    goalAmount: 25000,
    currentAmount: 18750,
    donorCount: 247,
    daysLeft: 23,
    image: '/campaigns/housing.jpg',
    urgent: true,
    featured: true,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Environmental Justice: Clean Water Access',
    description: 'Legal action to ensure clean water access for the Riverside community affected by industrial contamination.',
    category: 'Environmental',
    location: 'Flint, MI',
    goalAmount: 45000,
    currentAmount: 32100,
    donorCount: 412,
    daysLeft: 35,
    image: '/campaigns/water.jpg',
    urgent: false,
    featured: true,
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    title: 'Workplace Discrimination Defense',
    description: 'Defending Maria against workplace discrimination and wrongful termination at a major tech company.',
    category: 'Employment',
    location: 'San Francisco, CA',
    goalAmount: 35000,
    currentAmount: 28900,
    donorCount: 189,
    daysLeft: 18,
    image: '/campaigns/workplace.jpg',
    urgent: true,
    featured: false,
    createdAt: '2024-01-20'
  },
  {
    id: '4',
    title: 'Civil Rights Violation Case',
    description: 'Seeking justice for civil rights violations during a peaceful protest. Legal fees for constitutional law experts.',
    category: 'Civil Rights',
    location: 'Atlanta, GA',
    goalAmount: 50000,
    currentAmount: 41250,
    donorCount: 523,
    daysLeft: 42,
    image: '/campaigns/rights.jpg',
    urgent: false,
    featured: true,
    createdAt: '2024-01-05'
  },
  {
    id: '5',
    title: 'Immigration Family Reunification',
    description: 'Legal assistance to reunite the Martinez family separated by immigration enforcement actions.',
    category: 'Immigration',
    location: 'Phoenix, AZ',
    goalAmount: 20000,
    currentAmount: 15600,
    donorCount: 298,
    daysLeft: 28,
    image: '/campaigns/immigration.jpg',
    urgent: true,
    featured: false,
    createdAt: '2024-01-18'
  },
  {
    id: '6',
    title: 'Police Accountability Case',
    description: 'Holding law enforcement accountable for excessive force and civil rights violations in the Thompson case.',
    category: 'Police Accountability',
    location: 'Chicago, IL',
    goalAmount: 60000,
    currentAmount: 38400,
    donorCount: 675,
    daysLeft: 55,
    image: '/campaigns/police.jpg',
    urgent: false,
    featured: false,
    createdAt: '2024-01-08'
  }
]

const categories = [
  { name: 'All Categories', value: 'all', icon: Scale, count: mockCampaigns.length },
  { name: 'Civil Rights', value: 'Civil Rights', icon: Users2, count: 1 },
  { name: 'Housing Rights', value: 'Housing Rights', icon: Home, count: 1 },
  { name: 'Environmental', value: 'Environmental', icon: Globe, count: 1 },
  { name: 'Employment', value: 'Employment', icon: Briefcase, count: 1 },
  { name: 'Immigration', value: 'Immigration', icon: Users, count: 1 },
  { name: 'Police Accountability', value: 'Police Accountability', icon: Scale, count: 1 }
]

const sortOptions = [
  { name: 'Most Recent', value: 'recent' },
  { name: 'Most Funded', value: 'funded' },
  { name: 'Ending Soon', value: 'ending' },
  { name: 'Most Supporters', value: 'supporters' },
]

function CampaignCard({ campaign }: { campaign: any }) {
  const progressPercentage = Math.round((campaign.currentAmount / campaign.goalAmount) * 100)
  
  return (
    <StaggeredItem>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 bg-white">
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Scale className="w-16 h-16 text-blue-600/30" />
            </div>
          </div>
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            {campaign.urgent && (
              <Badge variant="destructive" className="text-xs font-medium">
                Urgent
              </Badge>
            )}
            {campaign.featured && (
              <Badge variant="secondary" className="text-xs font-medium">
                Featured
              </Badge>
            )}
          </div>
          <div className="absolute top-4 right-4">
            <Button size="sm" variant="ghost" className="rounded-full bg-white/90 hover:bg-white">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Badge variant="outline" className="text-xs">
              {campaign.category}
            </Badge>
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              {campaign.location}
            </div>
          </div>
          
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {campaign.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">
                ${campaign.currentAmount.toLocaleString()} raised
              </span>
              <span className="text-gray-500">
                of ${campaign.goalAmount.toLocaleString()}
              </span>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {campaign.donorCount} supporters
                </div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {campaign.daysLeft} days left
                </div>
              </div>
              <div className="font-medium text-blue-600">
                {progressPercentage}% funded
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-gray-100">
            <Link href={`/campaigns/${campaign.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full rounded-xl">
                View Details
              </Button>
            </Link>
            <Link href={`/donate/${campaign.id}`}>
              <Button size="sm" className="rounded-xl">
                Donate
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </StaggeredItem>
  )
}

function CampaignsContent() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [showFilters, setShowFilters] = useState(false)
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [loading, setLoading] = useState(false)

  // Filter and sort campaigns
  useEffect(() => {
    let filtered = mockCampaigns

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(campaign => 
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(campaign => campaign.category === selectedCategory)
    }

    // Sort campaigns
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'funded':
        filtered.sort((a, b) => b.currentAmount - a.currentAmount)
        break
      case 'ending':
        filtered.sort((a, b) => a.daysLeft - b.daysLeft)
        break
      case 'supporters':
        filtered.sort((a, b) => b.donorCount - a.donorCount)
        break
    }

    setCampaigns(filtered)
  }, [searchTerm, selectedCategory, sortBy])

  const handleSearch = (query: string) => {
    setSearchTerm(query)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSortBy('recent')
  }

  const activeFiltersCount = (searchTerm ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0) + (sortBy !== 'recent' ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp" className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Legal Defense <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Campaigns</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Support verified legal cases fighting for justice, civil rights, and social change. 
              Every contribution makes a difference.
            </p>
            <Link href="/campaigns/create">
              <Button size="lg" className="rounded-full">
                <Plus className="w-5 h-5 mr-2" />
                Submit a Case
              </Button>
            </Link>
          </AnimatedWrapper>

          {/* Search and Stats */}
          <div className="max-w-2xl mx-auto">
            <SearchInput
              placeholder="Search campaigns, categories, locations..."
              onSearch={handleSearch}
              className="mb-6"
            />
            
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{campaigns.length}</div>
                <div>Active Cases</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">$2.4M</div>
                <div>Total Raised</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">89%</div>
                <div>Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Results */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-xl"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown className={cn(
                  "w-4 h-4 ml-2 transition-transform duration-200",
                  showFilters && "rotate-180"
                )} />
              </Button>
              
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-xl">
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {campaigns.length} campaigns found
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <AnimatedWrapper variant="slideUp" className="mb-8">
              <Card className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Categories */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <button
                          key={category.value}
                          onClick={() => setSelectedCategory(category.value)}
                          className={cn(
                            "flex items-center justify-between w-full px-3 py-2 text-sm rounded-xl transition-all duration-200",
                            selectedCategory === category.value
                              ? "bg-blue-100 text-blue-700"
                              : "hover:bg-gray-100 text-gray-700"
                          )}
                        >
                          <div className="flex items-center">
                            <category.icon className="w-4 h-4 mr-2" />
                            {category.name}
                          </div>
                          <span className="text-xs text-gray-500">{category.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Filters */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Status</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">Featured Cases</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">Urgent Cases</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">Nearly Funded</span>
                      </label>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Location</h3>
                    <select className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>All Locations</option>
                      <option>California</option>
                      <option>New York</option>
                      <option>Texas</option>
                      <option>Florida</option>
                    </select>
                  </div>
                </div>
              </Card>
            </AnimatedWrapper>
          )}

          {/* Campaign Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all campaigns.</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </StaggeredList>
          )}

          {/* Load More */}
          {campaigns.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" className="rounded-full">
                Load More Campaigns
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp">
            <h2 className="text-3xl font-bold text-white mb-4">
              Need Legal Defense Funding?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Submit your case for review and connect with supporters who believe in justice.
            </p>
            <Link href="/campaigns/create">
              <Button size="lg" variant="secondary" className="rounded-full">
                Submit Your Case
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </AnimatedWrapper>
        </div>
      </section>
    </div>
  )
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    }>
      <CampaignsContent />
    </Suspense>
  )
}