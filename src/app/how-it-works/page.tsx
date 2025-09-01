import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AnimatedWrapper, StaggeredList, StaggeredItem } from '@/components/ui/AnimatedWrapper'
import { 
  FileText, 
  Search, 
  Users, 
  CreditCard, 
  Scale, 
  CheckCircle,
  ArrowRight,
  Shield,
  Eye,
  Award,
  Clock,
  DollarSign,
  UserCheck
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'How It Works | Legal Defense Fund',
  description: 'Learn how our platform connects people who need legal defense with supporters who believe in justice for all.',
}

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Submit Your Case',
    description: 'Legal professionals or individuals submit verified cases that need funding support.',
    details: [
      'Complete case verification process',
      'Provide legal documentation',
      'Set funding goals and timeline',
      'Attorney review and approval'
    ]
  },
  {
    number: '02', 
    icon: Search,
    title: 'Case Review & Verification',
    description: 'Our legal experts review and verify each case to ensure legitimacy and merit.',
    details: [
      'Legal merit assessment',
      'Documentation verification',
      'Background checks',
      'Compliance review'
    ]
  },
  {
    number: '03',
    icon: Users,
    title: 'Community Discovery',
    description: 'Approved cases are published for the community to discover and support.',
    details: [
      'Professional case presentation',
      'Transparent fund tracking',
      'Regular updates provided',
      'Community engagement tools'
    ]
  },
  {
    number: '04',
    icon: CreditCard,
    title: 'Secure Funding',
    description: 'Supporters contribute funds through our secure platform with full transparency.',
    details: [
      'Secure payment processing',
      'Transparent fund allocation',
      'Real-time progress tracking',
      'Tax-deductible donations'
    ]
  },
  {
    number: '05',
    icon: Scale,
    title: 'Legal Action',
    description: 'Funds are released to qualified attorneys to pursue justice on behalf of the case.',
    details: [
      'Verified attorney disbursement',
      'Legal milestone tracking',
      'Progress reporting',
      'Outcome transparency'
    ]
  }
]

const features = [
  {
    icon: Shield,
    title: 'Verified Cases Only',
    description: 'Every case undergoes rigorous verification by legal experts before publication.'
  },
  {
    icon: Eye,
    title: 'Complete Transparency', 
    description: 'Track exactly how funds are used with detailed reporting and case updates.'
  },
  {
    icon: Award,
    title: 'Proven Success',
    description: 'Our platform has a 89% success rate in cases that reach full funding.'
  },
  {
    icon: Clock,
    title: 'Fast Processing',
    description: 'Cases are typically reviewed and published within 48 hours of submission.'
  }
]

const forLawyers = [
  {
    icon: FileText,
    title: 'Submit Cases',
    description: 'Present your client\'s case to our community of supporters with detailed documentation and funding goals.'
  },
  {
    icon: DollarSign,
    title: 'Secure Funding',
    description: 'Receive verified funding directly to your trust account with transparent tracking and reporting.'
  },
  {
    icon: Users,
    title: 'Build Support',
    description: 'Engage with supporters through updates, testimonials, and case progress reports.'
  }
]

const forSupporters = [
  {
    icon: Search,
    title: 'Discover Cases',
    description: 'Browse verified legal cases across civil rights, environmental, and social justice categories.'
  },
  {
    icon: CreditCard,
    title: 'Contribute Securely',
    description: 'Make tax-deductible contributions with complete transparency on fund usage and case progress.'
  },
  {
    icon: Eye,
    title: 'Track Progress',
    description: 'Receive regular updates on case developments and see the direct impact of your support.'
  }
]

const faqs = [
  {
    question: 'How do you verify cases?',
    answer: 'Each case undergoes a multi-step verification process including legal merit review, documentation verification, background checks, and attorney validation.'
  },
  {
    question: 'What types of cases do you support?',
    answer: 'We focus on civil rights, environmental justice, discrimination, wrongful termination, housing rights, and other cases that promote social justice and equality.'
  },
  {
    question: 'How are funds disbursed?',
    answer: 'Funds are released directly to verified attorneys in milestone-based payments, with full transparency and accountability to donors.'
  },
  {
    question: 'What fees do you charge?',
    answer: 'We charge a 2.9% platform fee to cover payment processing, case verification, and platform maintenance. 97.1% of donations go directly to legal fees.'
  },
  {
    question: 'Can I get a tax deduction?',
    answer: 'Yes, contributions through our 501(c)(3) partner organizations are tax-deductible. You\'ll receive proper documentation for tax purposes.'
  },
  {
    question: 'What happens if a case is not fully funded?',
    answer: 'Partial funding can still help with specific legal services. In cases of significant shortfalls, we work to redirect funds to similar cases with donor consent.'
  }
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AnimatedWrapper variant="slideUp">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                How It <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Works</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                Our platform connects people who need legal representation with a community 
                of supporters who believe in justice for all. Here's how we make it happen.
              </p>
            </AnimatedWrapper>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Process
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From case submission to legal resolution, every step is transparent and accountable.
            </p>
          </AnimatedWrapper>

          <div className="space-y-16">
            {steps.map((step, index) => (
              <AnimatedWrapper key={step.number} variant="slideUp" delay={index * 0.2}>
                <div className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center mb-6">
                      <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl font-bold text-xl mr-4">
                        {step.number}
                      </div>
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                        <step.icon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="space-y-3">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <step.icon className="w-32 h-32 text-blue-600/30" />
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with security, transparency, and effectiveness at its core.
            </p>
          </AnimatedWrapper>

          <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <StaggeredItem key={feature.title}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white group">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                      <feature.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* For Lawyers Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedWrapper variant="slideRight">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-6">
                  <UserCheck className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  For Legal Professionals
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Expand your practice's impact by connecting with clients who need representation 
                  but lack the financial resources. Our platform provides the tools and community 
                  support to make justice accessible.
                </p>
                <Link href="/auth/register?type=lawyer">
                  <Button size="lg" className="rounded-full">
                    Join as Attorney
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </AnimatedWrapper>
            <AnimatedWrapper variant="slideLeft">
              <div className="space-y-6">
                {forLawyers.map((item, index) => (
                  <Card key={item.title} className="p-6 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </AnimatedWrapper>
          </div>
        </div>
      </section>

      {/* For Supporters Section */}
      <section className="py-24 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedWrapper variant="slideRight">
              <div className="space-y-6">
                {forSupporters.map((item, index) => (
                  <Card key={item.title} className="p-6 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </AnimatedWrapper>
            <AnimatedWrapper variant="slideLeft">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-6">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  For Supporters
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Make a meaningful impact by supporting legal cases that align with your values. 
                  Every contribution helps ensure that justice isn't determined by wealth.
                </p>
                <Link href="/campaigns">
                  <Button size="lg" className="rounded-full bg-purple-600 hover:bg-purple-700">
                    Browse Cases
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </AnimatedWrapper>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about how our platform works.
            </p>
          </AnimatedWrapper>

          <StaggeredList className="space-y-6">
            {faqs.map((faq, index) => (
              <StaggeredItem key={index}>
                <Card className="p-6 hover:shadow-md transition-all duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </Card>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 opacity-40"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of people who are helping to create a more equitable justice system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/campaigns/create">
                <Button size="lg" variant="secondary" className="rounded-full">
                  Submit a Case
                </Button>
              </Link>
              <Link href="/campaigns">
                <Button size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white hover:text-blue-600">
                  Support a Case
                </Button>
              </Link>
            </div>
          </AnimatedWrapper>
        </div>
      </section>
    </div>
  )
}