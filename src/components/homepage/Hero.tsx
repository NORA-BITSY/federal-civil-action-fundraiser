'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Play, Users, DollarSign, Scale } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Fund Justice.
                <br />
                <span className="text-blue-200">Fight for Rights.</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed">
                Connect with your community to raise funds for legal defense, civil rights cases, 
                and access to justice. Every case deserves a fair fight.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 py-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-6 h-6 text-blue-200" />
                </div>
                <div className="text-2xl font-bold">$12.5M+</div>
                <div className="text-blue-200 text-sm">Raised</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-blue-200" />
                </div>
                <div className="text-2xl font-bold">25,000+</div>
                <div className="text-blue-200 text-sm">Supporters</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Scale className="w-6 h-6 text-blue-200" />
                </div>
                <div className="text-2xl font-bold">1,200+</div>
                <div className="text-blue-200 text-sm">Cases Funded</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/campaign/create">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold">
                  Start Your Campaign
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              
              <Link href="/campaigns">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-blue-700 font-semibold"
                >
                  Browse Campaigns
                </Button>
              </Link>
            </div>

            {/* Video CTA */}
            <div className="flex items-center space-x-4 pt-4">
              <button className="flex items-center space-x-3 text-blue-200 hover:text-white transition-colors">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                  <Play className="w-5 h-5 ml-0.5" />
                </div>
                <span className="font-medium">Watch how it works</span>
              </button>
            </div>
          </div>

          {/* Hero Image/Video */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-w-16 aspect-h-9 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <Scale className="w-24 h-24 mx-auto mb-4 opacity-60" />
                  <h3 className="text-2xl font-semibold mb-2">Justice for All</h3>
                  <p className="text-blue-200">
                    Empowering communities to support legal battles that matter
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-4 w-48 animate-float">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">$15,250 raised</div>
                  <div className="text-sm text-gray-600">Civil Rights Case</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 w-48 animate-float" style={{animationDelay: '1s'}}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">186 supporters</div>
                  <div className="text-sm text-gray-600">Family Defense</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L50 105C100 90 200 60 300 45C400 30 500 30 600 37.5C700 45 800 60 900 67.5C1000 75 1100 75 1150 75L1200 75V120H1150C1100 120 1000 120 900 120C800 120 700 120 600 120C500 120 400 120 300 120C200 120 100 120 50 120H0Z"
            fill="rgb(249 250 251)"
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}