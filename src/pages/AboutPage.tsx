import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Users, Award, Globe, Heart, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import useSettings from '../hooks/useSettings'
import useImageLoader from '../hooks/useImageLoader'


gsap.registerPlugin(ScrollTrigger)

interface TeamMember {
  id: string
  name: string
  role: string
  image: string
  bio: string
}

interface Milestone {
  year: string
  title: string
  description: string
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Creative Director',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    bio: 'With over 15 years in fashion design, Sarah leads our creative vision with passion and innovation.'
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Head of Design',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    bio: 'Michael brings contemporary aesthetics and sustainable practices to every collection.'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    role: 'Brand Manager',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    bio: 'Emma ensures our brand story resonates with customers worldwide through strategic marketing.'
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Operations Director',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    bio: 'David oversees our global operations, ensuring quality and efficiency in every process.'
  }
]

const milestones: Milestone[] = [
  {
    year: '2018',
    title: 'Founded',
    description: 'Started with a vision to revolutionize contemporary fashion'
  },
  {
    year: '2019',
    title: 'First Collection',
    description: 'Launched our debut collection to critical acclaim'
  },
  {
    year: '2020',
    title: 'Global Expansion',
    description: 'Expanded to international markets across 15 countries'
  },
  {
    year: '2021',
    title: 'Sustainability Initiative',
    description: 'Committed to 100% sustainable materials and practices'
  },
  {
    year: '2022',
    title: 'Digital Innovation',
    description: 'Launched our cutting-edge e-commerce platform'
  },
  {
    year: '2023',
    title: 'Community Impact',
    description: 'Established partnerships with local artisans worldwide'
  }
]

const stats = [
  { icon: Users, label: 'Happy Customers', value: '50,000+' },
  { icon: Globe, label: 'Countries', value: '25+' },
  { icon: Award, label: 'Design Awards', value: '15+' },
  { icon: Heart, label: 'Years of Excellence', value: '5+' }
]

function ShimmerPlaceholder({ className }: { className?: string }) {
  return (
    <div className={`shimmer bg-gray-200 rounded-lg ${className}`} />
  )
}

function LazyImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const { loaded, loading, error } = useImageLoader(src)
  
  if (loading) {
    return <ShimmerPlaceholder className={className} />
  }
  
  if (error) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Image not available</span>
      </div>
    )
  }
  
  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: loaded ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    />
  )
}

export default function AboutPage() {
  const [loading, setLoading] = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)
  const storyRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const teamRef = useRef<HTMLDivElement>(null)
  
  useSettings() // Keep the hook call for potential future use
  
  useEffect(() => {
    // Simulate loading for dynamic content
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    if (!loading) {
      // GSAP Animations
      const tl = gsap.timeline()
      
      // Hero animation
      if (heroRef.current) {
        tl.fromTo(heroRef.current.children,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }
        )
      }
      
      // Story section animation
      if (storyRef.current) {
        gsap.fromTo(storyRef.current,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: storyRef.current,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      }
      
      // Timeline animation
      if (timelineRef.current) {
        const timelineItems = timelineRef.current.querySelectorAll('.timeline-item')
        gsap.fromTo(timelineItems,
          { x: -50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: timelineRef.current,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      }
      
      // Team animation
      if (teamRef.current) {
        const teamCards = teamRef.current.querySelectorAll('.team-card')
        gsap.fromTo(teamCards,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: teamRef.current,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      }
    }
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [loading])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Skeleton */}
        <section className="relative h-screen flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <ShimmerPlaceholder className="h-16 w-3/4 mx-auto" />
            <ShimmerPlaceholder className="h-6 w-2/3 mx-auto" />
            <ShimmerPlaceholder className="h-12 w-48 mx-auto" />
          </div>
        </section>
        
        {/* Content Skeleton */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <ShimmerPlaceholder className="h-8 w-3/4" />
                <ShimmerPlaceholder className="h-4 w-full" />
                <ShimmerPlaceholder className="h-4 w-5/6" />
                <ShimmerPlaceholder className="h-4 w-4/5" />
              </div>
              <ShimmerPlaceholder className="h-96 w-full" />
            </div>
          </div>
        </section>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <LazyImage
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Fashion atelier"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div ref={heroRef} className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
            Our Story
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Crafting tomorrow's fashion with passion, innovation, and sustainable practices
          </p>
          <Link
            to="/products"
            className="btn-primary bg-white text-black hover:bg-gray-100 text-lg px-8 py-4"
          >
            Explore Collection
          </Link>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-full mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-3xl font-bold text-black mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
      
      {/* Story Section */}
      <section ref={storyRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-black mb-6">
                Fashion Forward, Always
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Founded in 2018, our journey began with a simple yet powerful vision: to create 
                  fashion that doesn't just follow trends, but sets them. We believe that clothing 
                  is more than fabric and thread—it's a form of self-expression, a way to tell 
                  your unique story to the world.
                </p>
                <p>
                  Our commitment to excellence drives every decision we make, from the initial 
                  sketch to the final stitch. We work with the finest materials, collaborate 
                  with talented artisans, and embrace innovative techniques to bring you 
                  collections that are both timeless and contemporary.
                </p>
                <p>
                  Sustainability isn't just a buzzword for us—it's a core value. We're dedicated 
                  to responsible fashion practices, ensuring that our beautiful designs don't 
                  come at the cost of our planet's future.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  to="/contact"
                  className="btn-secondary inline-flex items-center space-x-2"
                >
                  <span>Get in Touch</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <LazyImage
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Fashion design process"
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Timeline Section */}
      <section ref={timelineRef} className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-black mb-6">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600">
              Milestones that shaped our brand and vision
            </p>
          </motion.div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300" />
            
            <div className="space-y-12">
              {milestones.map((milestone) => (
                <div key={milestone.year} className="timeline-item relative flex items-start">
                  <div className="flex-shrink-0 w-16 h-16 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
                    {milestone.year}
                  </div>
                  <div className="ml-8 flex-1">
                    <h3 className="text-xl font-semibold text-black mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section ref={teamRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-black mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The creative minds behind our innovative designs and exceptional customer experience
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-card group">
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <LazyImage
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-1">
                  {member.name}
                </h3>
                <p className="text-gray-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'Innovation',
                description: 'We constantly push boundaries to create fresh, exciting designs that set new standards in fashion.'
              },
              {
                title: 'Sustainability',
                description: 'Our commitment to the environment drives us to use eco-friendly materials and ethical practices.'
              },
              {
                title: 'Quality',
                description: 'Every piece is crafted with meticulous attention to detail, ensuring lasting beauty and durability.'
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h3 className="text-2xl font-semibold mb-4">{value.title}</h3>
                <p className="text-gray-300 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-black mb-6">
              Ready to Discover Your Style?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Explore our latest collections and find pieces that speak to your unique sense of style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="btn-primary text-lg px-8 py-4"
              >
                Shop Collection
              </Link>
              <Link
                to="/contact"
                className="btn-secondary text-lg px-8 py-4"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}