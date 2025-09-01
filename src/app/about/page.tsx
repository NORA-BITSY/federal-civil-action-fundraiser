import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AnimatedWrapper, StaggeredList, StaggeredItem } from '@/components/ui/AnimatedWrapper'
import { 
  Scale, 
  Users, 
  Heart, 
  Shield, 
  Award, 
  Globe,
  CheckCircle,
  ArrowRight,
  Quote
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us | Legal Defense Fund',
  description: 'Learn about our mission to provide accessible legal defense funding for civil rights cases and social justice initiatives.',
}

const stats = [
  { label: 'Cases Funded', value: '2,847', icon: Scale },
  { label: 'Funds Raised', value: '$12.4M', icon: Heart },
  { label: 'Active Supporters', value: '48K', icon: Users },
  { label: 'Success Rate', value: '89%', icon: Award },
]

const values = [
  {
    icon: Scale,
    title: 'Justice for All',
    description: 'We believe everyone deserves access to quality legal representation, regardless of their financial situation.'
  },
  {
    icon: Shield,
    title: 'Transparency',
    description: 'Every dollar raised is tracked and reported. Our donors know exactly how their contributions are being used.'
  },
  {
    icon: Users,
    title: 'Community-Driven',
    description: 'Our platform is built by and for the community, ensuring voices are heard and justice is served.'
  },
  {
    icon: Globe,
    title: 'Global Impact',
    description: 'From local civil rights cases to international human rights issues, we support justice worldwide.'
  }
]

const team = [
  {
    name: 'Sarah Chen',
    role: 'Founder & CEO',
    image: '/team/sarah.jpg',
    bio: 'Former civil rights attorney with 15 years of experience fighting for social justice.'
  },
  {
    name: 'Marcus Johnson',
    role: 'Chief Legal Officer',
    image: '/team/marcus.jpg', 
    bio: 'Constitutional law expert and former Supreme Court clerk dedicated to protecting civil liberties.'
  },
  {
    name: 'Dr. Aisha Patel',
    role: 'Chief Technology Officer',
    image: '/team/aisha.jpg',
    bio: 'MIT graduate with expertise in building secure, scalable platforms for social good.'
  },
  {
    name: 'David Rodriguez',
    role: 'Head of Community',
    image: '/team/david.jpg',
    bio: 'Community organizer and activist with deep roots in grassroots legal advocacy.'
  }
]

const milestones = [
  {
    year: '2019',
    title: 'Foundation Founded',
    description: 'Legal Defense Fund was established with a mission to democratize access to legal representation.'
  },
  {
    year: '2020',
    title: 'First $1M Raised',
    description: 'Community response exceeded expectations as we funded our first 100 cases.'
  },
  {
    year: '2021',
    title: 'National Expansion',
    description: 'Expanded operations to all 50 states, partnering with legal aid organizations nationwide.'
  },
  {
    year: '2022',
    title: 'International Launch',
    description: 'Began supporting human rights cases globally through partnerships with international NGOs.'
  },
  {
    year: '2023',
    title: 'Technology Innovation',
    description: 'Launched AI-powered case matching and transparent fund tracking systems.'
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AnimatedWrapper variant="slideUp">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-3xl mb-8">
                <Scale className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Justice Through Community
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                We're democratizing access to legal representation by connecting those who need 
                legal defense with a community of supporters who believe in justice for all.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/campaigns">
                  <Button size="lg" className="rounded-full">
                    Browse Cases
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/campaigns/create">
                  <Button variant="outline" size="lg" className="rounded-full">
                    Submit a Case
                  </Button>
                </Link>
              </div>
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
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                    <stat.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedWrapper variant="slideRight">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  The legal system shouldn't be a privilege reserved for the wealthy. Every person deserves 
                  quality legal representation when their rights are at stake. We bridge the gap between 
                  those who need legal defense and those who can provide it.
                </p>
                <div className="space-y-4">
                  {[
                    'Provide transparent, community-driven legal funding',
                    'Connect verified legal cases with passionate supporters', 
                    'Ensure accountability through detailed case tracking',
                    'Build a more equitable justice system for everyone'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedWrapper>
            <AnimatedWrapper variant="slideLeft">
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl"></div>
                <div className="absolute inset-8 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                  <Quote className="w-24 h-24 text-blue-600" />
                </div>
              </div>
            </AnimatedWrapper>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These principles guide every decision we make and every case we support.
            </p>
          </AnimatedWrapper>

          <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <StaggeredItem key={value.title}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                      <value.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600">
              Key milestones in our mission to democratize legal defense.
            </p>
          </AnimatedWrapper>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>
            <StaggeredList className="space-y-12">
              {milestones.map((milestone, index) => (
                <StaggeredItem key={milestone.year}>
                  <div className="relative flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full text-white font-bold">
                        {milestone.year}
                      </div>
                    </div>
                    <div className="ml-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </StaggeredItem>
              ))}
            </StaggeredList>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Passionate advocates, legal experts, and technology innovators united by a common goal.
            </p>
          </AnimatedWrapper>

          <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <StaggeredItem key={member.name}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <User className="w-24 h-24 text-blue-600/50" />
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 opacity-50"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp">
            <h2 className="text-4xl font-bold text-white mb-6">
              Join Our Mission
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Whether you're seeking legal defense or want to support others in their fight for justice, 
              you can make a difference today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/campaigns">
                <Button size="lg" variant="secondary" className="rounded-full">
                  Support a Case
                </Button>
              </Link>
              <Link href="/campaigns/create">
                <Button size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white hover:text-blue-600">
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