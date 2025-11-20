import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Mail, UsersRound, UserRound } from 'lucide-react'
import Image from 'next/image'
import FooterPage from '@/components/common/FooterPage';
import HeaderPage from '@/components/common/HeaderPage'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderPage />

      {/* Hero Section */}
      <main>
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-primary mb-8 leading-tight">
                  Connect Your <span className="text-secondary">Community</span>
                </h1>
                
                <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed text-justify">
                The 12 Gaam Samaj is a proud community of twelve closely connected villages near Vadodara, Gujarat. Rooted in shared history, culture, and traditions, our community is built on values of unity, respect, and togetherness.<br /><br />
                For generations, families from our 12 villages have stood strong in agriculture, business, education, and social service – contributing not only to our villages but also to the broader society. Today, as we embrace modern life, our traditions and values continue to guide us.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/join#registration"  className="bg-secondary hover:bg-secondary/90 text-white px-6 py-4 rounded-lg flex items-center gap-2 justify-center">
                  Get Started
                  <ArrowRight />
                  </Link>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="w-full max-w-lg h-auto lg:h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Image 
                    src="/image/logo.jpg"
                    alt="12 Gaam Samaj"
                    width={1000}
                    height={1000}
                    unoptimized
                    className='rounded-2xl overflow-hidden'
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Community Pillars Section */}
        {/* <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Community Pillars
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                For generations, families from our 12 villages have stood strong across multiple domains.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mb-6">
                    <Leaf className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Agriculture</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">
                    Rooted in farming traditions that have sustained our community for generations.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mb-6">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Business</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">
                    Entrepreneurial spirit driving economic growth in our villages and beyond.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mb-6">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Education</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">
                    Commitment to learning and knowledge that empowers future generations.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mb-6">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Social Service</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">
                    Dedication to helping others and contributing to the broader society.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section> */}

        {/* Our 12 Villages Section */}
        {/* <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our 12 Villages
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover the rich heritage of our connected communities.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <span className="text-gray-500">Village Image</span>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Village Name</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Rich in agricultural heritage with traditional farming practices
                  </p>
                  <Link href="/villages" className="text-gray-700 hover:text-blue-900 transition-colors">
                    Learn More →
                  </Link>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <span className="text-gray-500">Village Image</span>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Village Name</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Known for its vibrant community festivals and cultural events
                  </p>
                  <Link href="/villages" className="text-gray-700 hover:text-blue-900 transition-colors">
                    Learn More →
                  </Link>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <span className="text-gray-500">Village Image</span>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Village Name</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Center of education with schools serving the entire region
                  </p>
                  <Link href="/villages" className="text-gray-700 hover:text-blue-900 transition-colors">
                    Learn More →
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Link href="/villages">
                <Button size="lg" className="bg-blue-900 text-white hover:bg-blue-800">
                  View All Villages
                </Button>
              </Link>
            </div>
          </div>
        </section> */}

        {/* Embracing Modern Life with Traditional Values Section */}
        {/* <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                  Embracing Modern Life with Traditional Values
                </h2>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Today, as we embrace modern life, our traditions and values continue to guide us. 
                  Our community represents the perfect blend of heritage and progress, where ancient 
                  wisdom meets contemporary opportunities.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-blue-900 mr-4 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">Shared history and cultural heritage</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-blue-900 mr-4 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">Strong family and community bonds</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-blue-900 mr-4 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">Progressive outlook with traditional values</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="w-full max-w-md h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-lg">Community Gathering Image</span>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* Join Our Growing Community Section */}
        {/* <section className="py-12 md:py-20 bg-secondary/10">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              Join Our Growing Community
            </h2>
            <p className="text-base md:text-xl text-primary mb-8">
              Connect with fellow community members, stay updated on events, and be part of our shared journey forward.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="bg-secondary hover:bg-secondary/90 text-white px-6 py-4 rounded-lg flex items-center gap-2 justify-center">
              <UserRound size={20} />
              Register Now
              </Link>
              <Link href="/contact" className="bg-transparent hover:bg-primary hover:text-white text-primary px-6 py-4 rounded-lg flex items-center gap-2 justify-center">
              <Mail size={20} />
              Contact Us
              </Link>
            </div>
          </div>
        </section> */}
      </main>

      <FooterPage />
      
    </div>
  )
}
