'use client'

import { useState } from 'react'
import { Campaign } from '@/types/campaign'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Heart, Share2, MessageCircle, Calendar, MapPin, DollarSign, Users, TrendingUp, FileText, Image, Play } from 'lucide-react'

interface CampaignDetailsProps {
  campaign: Campaign
}

export function CampaignDetails({ campaign }: CampaignDetailsProps) {
  const [isDonating, setIsDonating] = useState(false)
  const [donationAmount, setDonationAmount] = useState('')

  const progressPercentage = (campaign.currentAmount / campaign.goalAmount) * 100

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  const handleDonation = async () => {
    setIsDonating(true)
    // Simulate donation processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsDonating(false)
    setDonationAmount('')
    // In real implementation, would integrate with payment processor
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {/* Campaign Header */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant="secondary" className="capitalize">
                        {campaign.category}
                      </Badge>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {campaign.title}
                    </h1>
                    <p className="text-xl text-gray-600 mb-4">
                      {campaign.subtitle}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Created {formatDate(campaign.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {campaign.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {campaign.donationCount} supporters
                      </div>
                    </div>
                  </div>

                  {/* Campaign Creator */}
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={campaign.user.avatar} />
                          <AvatarFallback>
                            {campaign.user.firstName[0]}{campaign.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {campaign.user.firstName} {campaign.user.lastName}
                          </h3>
                          <p className="text-gray-600 capitalize">
                            {campaign.user.accountType}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Main Image */}
                  {campaign.images.length > 0 && (
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={campaign.images[0].url}
                        alt={campaign.images[0].caption}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Fundraising Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Fundraising Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold">
                          {formatCurrency(campaign.currentAmount)}
                        </span>
                        <span className="text-sm text-gray-600">
                          of {formatCurrency(campaign.goalAmount)}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                      <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                        <span>{Math.round(progressPercentage)}% funded</span>
                        <span>{campaign.donationCount} supporters</span>
                      </div>
                    </div>

                    {/* Donation Form */}
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          {[25, 50, 100].map((amount) => (
                            <Button
                              key={amount}
                              variant="outline"
                              size="sm"
                              onClick={() => setDonationAmount(amount.toString())}
                              className="text-sm"
                            >
                              ${amount}
                            </Button>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            placeholder="Enter amount"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <Button
                          onClick={handleDonation}
                          disabled={!donationAmount || isDonating}
                          className="w-full"
                        >
                          {isDonating ? 'Processing...' : 'Donate Now'}
                        </Button>
                      </div>
                    </div>

                    {/* Social Actions */}
                    <div className="border-t pt-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Heart className="h-4 w-4 mr-1" />
                          Follow
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Campaign Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Key Dates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created</span>
                      <span className="text-sm font-medium">
                        {formatDate(campaign.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Goal Date</span>
                      <span className="text-sm font-medium">
                        {formatDate(campaign.targetDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Update</span>
                      <span className="text-sm font-medium">
                        {formatDate(campaign.updatedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="story" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="story">Story</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          {/* Story Tab */}
          <TabsContent value="story" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Story</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {campaign.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Legal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Legal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Case Type</h4>
                  <p className="text-gray-700">{campaign.legalDetails.caseType}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Court Information</h4>
                  <p className="text-gray-700">{campaign.legalDetails.court}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Attorney</h4>
                  <p className="text-gray-700">{campaign.legalDetails.attorney}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Case Summary</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {campaign.legalDetails.caseSummary}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Media Gallery */}
            {(campaign.images.length > 1 || campaign.videos.length > 0 || campaign.documents.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Media & Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campaign.images.slice(1).map((image, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.caption}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all cursor-pointer flex items-center justify-center">
                          <Image className="h-6 w-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                    {campaign.videos.map((video, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden bg-gray-200">
                        <div className="w-full h-32 flex items-center justify-center">
                          <Play className="h-8 w-8 text-gray-600" />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-10 hover:bg-opacity-20 transition-all cursor-pointer" />
                      </div>
                    ))}
                    {campaign.documents.map((doc, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-6 w-6 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium truncate">{doc.title}</p>
                            <p className="text-xs text-gray-500">{doc.type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-6">
            {campaign.updates && campaign.updates.length > 0 ? (
              campaign.updates.map((update, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{update.title}</CardTitle>
                      <span className="text-sm text-gray-500">
                        {formatDate(update.createdAt)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{update.content}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No updates posted yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Breakdown</CardTitle>
                <CardDescription>
                  How the funds will be allocated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaign.budgetBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="font-medium">{item.category}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.amount)}</p>
                      <p className="text-sm text-gray-500">
                        {Math.round((item.amount / campaign.goalAmount) * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Legal Documents</CardTitle>
                <CardDescription>
                  Case-related documents and evidence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaign.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6 text-gray-600" />
                        <div>
                          <h4 className="font-medium">{doc.title}</h4>
                          <p className="text-sm text-gray-600">{doc.type}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Community Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {campaign.comments && campaign.comments.length > 0 ? (
                  <div className="space-y-4">
                    {campaign.comments.map((comment, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {comment.author.firstName[0]}{comment.author.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="font-medium text-sm">
                                {comment.author.firstName} {comment.author.lastName}
                              </h5>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}