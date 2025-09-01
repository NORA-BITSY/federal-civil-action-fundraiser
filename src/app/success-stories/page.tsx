import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AnimatedWrapper, StaggeredList, StaggeredItem } from '@/components/ui/AnimatedWrapper'
import { 
  CheckCircle,
  ArrowRight,
  Quote,
  Calendar,
  DollarSign,
  Users,
  Award,
  Heart,
  Scale
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Success Stories | Legal Defense Fund',
  description: 'Real stories of justice achieved through community support and legal defense funding.',
}

const successStories = [
  {
    id: '1',
    title: 'Housing Rights Victory for the Johnson Family',
    category: 'Housing Rights',
    result: 'Settlement Reached',
    amount: '$25,000',
    supporters: 247,
    timeline: '4 months',
    description: 'After facing discriminatory housing practices, the Johnson family fought back with community support and achieved a landmark settlement.',
    impact: 'This case set a precedent for housing discrimination cases in Oakland and led to policy changes protecting future tenants.',
    quote: "The community support gave us hope when we felt powerless. We couldn't have fought this battle alone.",
    author: 'Maria Johnson',
    image: '/stories/housing-victory.jpg',
    featured: true
  },
  {
    id: '2', 
    title: 'Clean Water Access Secured for Riverside Community',
    category: 'Environmental Justice',
    result: 'Court Victory',
    amount: '$45,000',
    supporters: 412,
    timeline: '8 months',
    description: 'A community fighting for clean water access after industrial contamination achieved a major court victory.',
    impact: 'The ruling forced the responsible company to pay for water system upgrades and medical monitoring for affected residents.',
    quote: "Our children now have clean water to drink. The legal team funded by this community made all the difference.",
    author: 'Robert Martinez',
    image: '/stories/water-victory.jpg',
    featured: true
  },
  {
    id: '3',
    title: 'Workplace Discrimination Case Wins $150K Settlement',
    category: 'Employment Rights',
    result: 'Settlement Victory',
    amount: '$35,000',
    supporters: 189,
    timeline: '6 months',
    description: 'Maria Chen\'s fight against workplace discrimination at a major tech company resulted in policy changes and compensation.',
    impact: 'The company implemented new anti-discrimination policies and established a diversity task force.',
    quote: "This victory wasn't just for me, but for every employee who faces discrimination in the workplace.",
    author: 'Maria Chen',
    image: '/stories/workplace-victory.jpg',
    featured: false
  },
  {
    id: '4',
    title: 'Civil Rights Violation Case Leads to Police Reform',
    category: 'Civil Rights',
    result: 'Policy Reform',
    amount: '$50,000',
    supporters: 523,
    timeline: '10 months',
    description: 'A civil rights violation case that started with community funding led to significant police department reforms.',
    impact: 'New training protocols, body camera requirements, and civilian oversight board established.',
    quote: "Change came because people believed in justice and put their money where their values are.",
    author: 'David Thompson',
    image: '/stories/civil-rights-victory.jpg',
    featured: true
  },
  {
    id: '5',
    title: 'Immigration Family Reunification Success',
    category: 'Immigration Rights',
    result: 'Family Reunited',
    amount: '$20,000',
    supporters: 298,
    timeline: '5 months',
    description: 'The Martinez family was reunited after being separated by immigration enforcement, thanks to expert legal representation.',
    impact: 'The case helped establish precedent for similar family separation cases and led to faster reunification processes.',
    quote: "Our family is whole again. We are forever grateful to everyone who supported us.",
    author: 'Carmen Martinez',
    image: '/stories/immigration-victory.jpg',
    featured: false
  },
  {
    id: '6',
    title: 'Police Accountability Case Results in $2M Award',
    category: 'Police Accountability',
    result: 'Jury Award',
    amount: '$60,000',
    supporters: 675,
    timeline: '12 months',
    description: 'A case of excessive force that began with crowdfunded legal fees resulted in a significant jury award and policy changes.',
    impact: 'Department-wide training overhaul, new use-of-force policies, and independent oversight committee established.',
    quote: "Justice was served because ordinary people came together to fund an extraordinary legal fight.",
    author: 'James Wilson',
    image: '/stories/accountability-victory.jpg',
    featured: false
  }
]

const stats = [
  { label: 'Cases Won', value: '89%', icon: Award },
  { label: 'Total Raised', value: '$2.4M', icon: DollarSign },
  { label: 'Lives Changed', value: '15K+', icon: Heart },
  { label: 'Policy Changes', value: '23', icon: Scale },
]

function StoryCard({ story }: { story: any }) {
  return (
    <StaggeredItem>
      <Card className={`h-full overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 bg-white ${story.featured ? 'ring-2 ring-blue-100' : ''}`}>
        {story.featured && (
          <div className="bg-blue-600 text-white px-4 py-2">
            <div className="flex items-center justify-center">
              <Award className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Featured Success</span>
            </div>
          </div>
        )}
        
        <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-blue-600/40" />
          </div>
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="text-xs font-medium bg-white/90">
              {story.category}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              {story.result}
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {story.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {story.description}
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="text-sm font-semibold text-gray-900">{story.amount}</div>
              <div className="text-xs text-gray-500">Raised</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{story.supporters}</div>
              <div className="text-xs text-gray-500">Supporters</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{story.timeline}</div>
              <div className="text-xs text-gray-500">Duration</div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <div className="flex items-start space-x-3">
              <Quote className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 italic mb-2">"{story.quote}"</p>
                <p className="text-xs font-medium text-gray-900">— {story.author}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Impact:</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{story.impact}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </StaggeredItem>
  )
}

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AnimatedWrapper variant="slideUp">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-3xl mb-8">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Success <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Stories</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                Real victories achieved through community support. These stories show the power 
                of collective action in the fight for justice and equality.
              </p>
              <Link href="/campaigns">
                <Button size="lg" className="rounded-full">
                  Support a Case Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </AnimatedWrapper>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggeredList className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <StaggeredItem key={stat.label}>
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4 group-hover:bg-green-200 transition-colors duration-300">
                    <stat.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* Success Stories Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Victories Made Possible by Community Support
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Each story represents lives changed, precedents set, and justice served through 
              the power of collective funding.
            </p>
          </AnimatedWrapper>

          <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {successStories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              The Ripple Effect of Justice
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Every successful case creates lasting change that extends far beyond the individual victory. 
              Legal precedents are set, policies are reformed, and communities are empowered to seek justice.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scale className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Legal Precedents</h3>
                <p className="text-sm text-gray-600">Setting new standards for future cases</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Policy Reform</h3>
                <p className="text-sm text-gray-600">Driving systemic change in institutions</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Community Impact</h3>
                <p className="text-sm text-gray-600">Inspiring others to stand up for justice</p>
              </div>
            </div>
          </AnimatedWrapper>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 opacity-40"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp">
            <h2 className="text-4xl font-bold text-white mb-6">
              Be Part of the Next Success Story
            </h2>
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              Your support today could be the difference between injustice ignored and justice served.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/campaigns">
                <Button size="lg" variant="secondary" className="rounded-full">
                  Browse Active Cases
                </Button>
              </Link>
              <Link href="/campaigns/create">
                <Button size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white hover:text-green-600">
                  Submit Your Case
                </Button>
              </Link>
            </div>
          </AnimatedWrapper>
        </div>
      </section>
    </div>
  )
}