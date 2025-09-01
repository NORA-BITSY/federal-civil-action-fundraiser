'use client'
import { DollarSign, Users, Scale, Trophy, Heart, Gavel } from 'lucide-react'

const stats = [
  {
    name: 'Total Raised',
    value: '$12.5M+',
    description: 'Funds raised for legal defense',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    name: 'Active Supporters',
    value: '25,000+',
    description: 'Community members helping',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'Cases Funded',
    value: '1,200+',
    description: 'Legal cases supported',
    icon: Scale,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    name: 'Success Rate',
    value: '87%',
    description: 'Cases resolved favorably',
    icon: Trophy,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  {
    name: 'Average Support',
    value: '$125',
    description: 'Per donor contribution',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  {
    name: 'Attorney Partners',
    value: '500+',
    description: 'Legal professionals in network',
    icon: Gavel,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  }
]

export function Stats() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Making Justice Accessible
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our platform has connected thousands of people with the legal support they need. 
            Together, we&apos;re building a more just society.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <div key={stat.name} className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${stat.bgColor} mb-4`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {stat.name}
                </div>
                <div className="text-gray-600">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Join the Fight for Justice
              </h3>
              <p className="text-gray-700 mb-6">
                Every case tells a story of someone fighting for what&apos;s right. When communities 
                come together, we can level the playing field and ensure everyone has access to justice.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Start a Campaign
                </button>
                <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Learn More
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Scale className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Latest Success</div>
                    <div className="text-sm text-gray-600">Civil Rights Case Won</div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">
                  &ldquo;Thanks to the community&apos;s support, we were able to secure justice 
                  and set an important precedent for future cases.&rdquo;
                </p>
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>245 supporters raised $18,750</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}