import { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { AnimatedWrapper, StaggeredList, StaggeredItem } from '@/components/ui/AnimatedWrapper'
import { 
  MessageSquare,
  Mail,
  Phone,
  Clock,
  HelpCircle,
  Book,
  Users,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Support & Help Center | Legal Defense Fund',
  description: 'Get help with your legal defense campaign or find answers to common questions about our platform.',
}

const supportOptions = [
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    availability: 'Mon-Fri, 9AM-6PM EST',
    action: 'Start Chat',
    primary: true
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send us a detailed message about your issue',
    availability: 'Response within 24 hours',
    action: 'Send Email',
    primary: false
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Speak directly with a support specialist',
    availability: 'Mon-Fri, 9AM-5PM EST',
    action: 'Call Now',
    primary: false
  }
]

const helpCategories = [
  {
    icon: HelpCircle,
    title: 'Getting Started',
    description: 'Learn how to create campaigns and navigate the platform',
    articles: [
      'How to create your first campaign',
      'Setting up your profile',
      'Understanding our verification process',
      'Tips for successful fundraising'
    ]
  },
  {
    icon: Book,
    title: 'Legal Guidelines',
    description: 'Understand the legal requirements and compliance',
    articles: [
      'Eligible case types',
      'Required documentation',
      'Legal professional verification',
      'Compliance and regulations'
    ]
  },
  {
    icon: Users,
    title: 'For Supporters',
    description: 'Information for those donating to campaigns',
    articles: [
      'How donations work',
      'Tax deduction information',
      'Tracking your contributions',
      'Refund and dispute process'
    ]
  }
]

const faqs = [
  {
    question: 'How do I create a legal defense campaign?',
    answer: 'To create a campaign, you need to be a verified legal professional or have one represent your case. Click "Submit a Case" and follow the verification process which includes providing legal documentation and case details.',
    category: 'Getting Started'
  },
  {
    question: 'What types of legal cases are eligible?',
    answer: 'We support civil rights cases, discrimination claims, environmental justice, housing rights, employment disputes, and other cases promoting social justice. Criminal defense cases are generally not eligible.',
    category: 'Legal Guidelines'
  },
  {
    question: 'How are funds disbursed to attorneys?',
    answer: 'Funds are released directly to verified attorneys in milestone-based payments. We require detailed invoices and progress reports to ensure transparency and accountability.',
    category: 'Legal Guidelines'
  },
  {
    question: 'Are donations tax-deductible?',
    answer: 'Yes, donations made through our 501(c)(3) partner organizations are tax-deductible. You will receive proper documentation for tax purposes after making a contribution.',
    category: 'For Supporters'
  },
  {
    question: 'What fees does the platform charge?',
    answer: 'We charge a 2.9% platform fee to cover payment processing, verification, and platform maintenance. 97.1% of every donation goes directly to legal expenses.',
    category: 'Getting Started'
  },
  {
    question: 'How do I track the progress of a case I supported?',
    answer: 'You can track case progress through your dashboard. Campaign creators provide regular updates, and you\'ll receive notifications about major milestones and developments.',
    category: 'For Supporters'
  }
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AnimatedWrapper variant="slideUp">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-3xl mb-8">
                <MessageSquare className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                How Can We <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Help?</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                Get the support you need for your legal defense campaign or find answers 
                to your questions about our platform.
              </p>
            </AnimatedWrapper>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp" className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600">
              Choose the best way to reach our support team
            </p>
          </AnimatedWrapper>

          <StaggeredList className="grid md:grid-cols-3 gap-8">
            {supportOptions.map((option) => (
              <StaggeredItem key={option.title}>
                <Card className={`h-full hover:shadow-lg transition-all duration-300 border-0 bg-white ${option.primary ? 'ring-2 ring-blue-100' : ''}`}>
                  <CardContent className="p-8 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${option.primary ? 'bg-blue-600' : 'bg-gray-100'}`}>
                      <option.icon className={`w-8 h-8 ${option.primary ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {option.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {option.description}
                    </p>
                    <div className="flex items-center justify-center text-sm text-gray-500 mb-6">
                      <Clock className="w-4 h-4 mr-2" />
                      {option.availability}
                    </div>
                    <Button 
                      variant={option.primary ? 'default' : 'outline'} 
                      className="w-full rounded-xl"
                    >
                      {option.action}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp">
            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Send us a Message
                  </h2>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you within 24 hours
                  </p>
                </div>

                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      placeholder="Enter your first name"
                      required
                    />
                    <Input
                      label="Last Name" 
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                  
                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <select className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>General Question</option>
                      <option>Campaign Support</option>
                      <option>Technical Issue</option>
                      <option>Legal Verification</option>
                      <option>Payment Issue</option>
                      <option>Report a Problem</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      rows={6}
                      className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe your question or issue in detail..."
                      required
                    ></textarea>
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full rounded-xl">
                    Send Message
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </AnimatedWrapper>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp" className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Help Categories
            </h2>
            <p className="text-lg text-gray-600">
              Browse our knowledge base by topic
            </p>
          </AnimatedWrapper>

          <StaggeredList className="grid md:grid-cols-3 gap-8">
            {helpCategories.map((category) => (
              <StaggeredItem key={category.title}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                        <category.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {category.description}
                    </p>
                    <div className="space-y-2">
                      {category.articles.map((article, index) => (
                        <a
                          key={index}
                          href="#"
                          className="flex items-center text-sm text-gray-700 hover:text-blue-600 transition-colors group"
                        >
                          <ArrowRight className="w-3 h-3 mr-2 text-gray-400 group-hover:text-blue-600" />
                          {article}
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp" className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions
            </p>
          </AnimatedWrapper>

          <StaggeredList className="space-y-6">
            {faqs.map((faq, index) => (
              <StaggeredItem key={index}>
                <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <HelpCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {faq.question}
                          </h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {faq.category}
                          </span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp" className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Additional Resources
            </h2>
            <p className="text-lg text-gray-600">
              More ways to get the information you need
            </p>
          </AnimatedWrapper>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedWrapper variant="slideUp" delay={0.1}>
              <Card className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-blue-50">
                <CardContent className="p-8">
                  <Info className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Legal Resources
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Access legal guides and templates
                  </p>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    Browse Resources
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </AnimatedWrapper>

            <AnimatedWrapper variant="slideUp" delay={0.2}>
              <Card className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-green-50">
                <CardContent className="p-8">
                  <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Community Forum
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Connect with other users and share experiences
                  </p>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    Join Community
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </AnimatedWrapper>

            <AnimatedWrapper variant="slideUp" delay={0.3}>
              <Card className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-purple-50">
                <CardContent className="p-8">
                  <Book className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Video Tutorials
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Step-by-step guides for using our platform
                  </p>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    Watch Videos
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </AnimatedWrapper>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-16 bg-red-50 border-t border-red-100">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <AnimatedWrapper variant="slideUp">
            <div className="flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                Emergency Legal Situations
              </h2>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              If you're facing an immediate legal emergency or time-sensitive situation, 
              please contact our emergency support line for prioritized assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-red-600 hover:bg-red-700 rounded-xl">
                <Phone className="w-4 h-4 mr-2" />
                Emergency Hotline
              </Button>
              <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-xl">
                <Mail className="w-4 h-4 mr-2" />
                Priority Email
              </Button>
            </div>
          </AnimatedWrapper>
        </div>
      </section>
    </div>
  )
}