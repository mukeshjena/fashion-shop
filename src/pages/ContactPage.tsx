import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Youtube
} from 'lucide-react'
import useSettings from '../hooks/useSettings'
import LoadingSpinner from '../components/ui/LoadingSpinner'

gsap.registerPlugin(ScrollTrigger)

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

interface ContactInfo {
  icon: any
  title: string
  details: string[]
  link?: string
}

function ShimmerPlaceholder({ className }: { className?: string }) {
  return (
    <div className={`shimmer bg-gray-200 rounded-lg ${className}`} />
  )
}

export default function ContactPage() {
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const heroRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  
  const { settings } = useSettings()
  
  useEffect(() => {
    // Simulate loading for dynamic content
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    
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
      
      // Form animation
      if (formRef.current) {
        gsap.fromTo(formRef.current,
          { x: -50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: formRef.current,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      }
      
      // Info animation
      if (infoRef.current) {
        gsap.fromTo(infoRef.current,
          { x: 50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: infoRef.current,
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setFormLoading(true)
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, you would send the form data to your backend
      console.log('Form submitted:', formData)
      
      setFormSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors({ submit: 'Failed to send message. Please try again.' })
    } finally {
      setFormLoading(false)
    }
  }
  
  const handleWhatsAppContact = () => {
    if (settings?.whatsapp_phone_number) {
      const message = encodeURIComponent('Hi! I would like to get in touch with you.')
      const whatsappUrl = `https://wa.me/${settings.whatsapp_phone_number.replace(/[^\d]/g, '')}?text=${message}`
      window.open(whatsappUrl, '_blank')
    }
  }
  
  const contactInfo: ContactInfo[] = [
    {
      icon: Mail,
      title: 'Email Us',
      details: [
        settings?.contact_email || 'info@fashionshop.com',
        'Available 24/7'
      ],
      link: `mailto:${settings?.contact_email || 'info@fashionshop.com'}`
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: [
        settings?.contact_phone || '+1 (555) 123-4567',
        'Mon-Fri 9AM-6PM EST'
      ],
      link: `tel:${settings?.contact_phone || '+15551234567'}`
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: [
        '123 Fashion Street',
        'New York, NY 10001'
      ]
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: [
        'Mon-Fri: 9AM-6PM',
        'Sat-Sun: 10AM-4PM'
      ]
    }
  ]
  
  const socialLinks = [
    {
      icon: Instagram,
      name: 'Instagram',
      url: settings?.social_instagram || '#',
      color: 'hover:text-pink-600'
    },
    {
      icon: Facebook,
      name: 'Facebook',
      url: settings?.social_facebook || '#',
      color: 'hover:text-blue-600'
    },
    {
      icon: Twitter,
      name: 'Twitter',
      url: settings?.social_twitter || '#',
      color: 'hover:text-blue-400'
    },
    {
      icon: Youtube,
      name: 'YouTube',
      url: settings?.social_youtube || '#',
      color: 'hover:text-red-600'
    }
  ]
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Skeleton */}
        <section className="relative h-96 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <ShimmerPlaceholder className="h-12 w-3/4 mx-auto" />
            <ShimmerPlaceholder className="h-6 w-2/3 mx-auto" />
          </div>
        </section>
        
        {/* Content Skeleton */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-6">
                <ShimmerPlaceholder className="h-8 w-1/2" />
                <ShimmerPlaceholder className="h-12 w-full" />
                <ShimmerPlaceholder className="h-12 w-full" />
                <ShimmerPlaceholder className="h-32 w-full" />
                <ShimmerPlaceholder className="h-12 w-1/3" />
              </div>
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <ShimmerPlaceholder className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <ShimmerPlaceholder className="h-4 w-1/3" />
                      <ShimmerPlaceholder className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gray-50 dark:bg-gray-800 py-20">
        <div ref={heroRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 dark:text-gray-100 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>
      
      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div ref={formRef}>
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100 mb-8">
                Send us a Message
              </h2>
              
              {formSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center"
                >
                  <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-green-600 dark:text-green-300">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="mt-6 btn-primary"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errors.submit && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
                      {errors.submit}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                          errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                          errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                        errors.subject ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="What's this about?"
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                        errors.message ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Tell us more about your inquiry..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
                  >
                    {formLoading ? (
                      <LoadingSpinner size="sm" className="border-white border-t-transparent" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    <span>{formLoading ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>
            
            {/* Contact Information */}
            <div ref={infoRef}>
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100 mb-8">
                Contact Information
              </h2>
              
              <div className="space-y-8">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon
                  return (
                    <motion.div
                      key={info.title}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-4"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {info.title}
                        </h3>
                        <div className="space-y-1">
                          {info.details.map((detail, i) => (
                            <p key={i} className="text-gray-600 dark:text-gray-300">
                              {info.link && i === 0 ? (
                                <a
                                  href={info.link}
                                  className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                  {detail}
                                </a>
                              ) : (
                                detail
                              )}
                            </p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              
              {/* WhatsApp Contact */}
              {settings?.whatsapp_phone_number && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">
                        Quick WhatsApp Contact
                      </h3>
                      <p className="text-green-600 dark:text-green-300 text-sm mb-3">
                        Get instant support via WhatsApp
                      </p>
                      <button
                        onClick={handleWhatsAppContact}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                      >
                        Chat on WhatsApp
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Social Media */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="mt-8"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Follow Us
                </h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => {
                    const Icon = social.icon
                    return (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center transition-colors ${social.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-gray-100 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Quick answers to common questions
            </p>
          </motion.div>
          
          <div className="space-y-6">
            {[
              {
                question: 'What are your shipping options?',
                answer: 'We offer free standard shipping on orders over $100. Express shipping is available for $15.'
              },
              {
                question: 'What is your return policy?',
                answer: 'We accept returns within 30 days of purchase. Items must be in original condition with tags attached.'
              },
              {
                question: 'Do you ship internationally?',
                answer: 'Yes, we ship to over 25 countries worldwide. International shipping rates vary by location.'
              },
              {
                question: 'How can I track my order?',
                answer: 'Once your order ships, you\'ll receive a tracking number via email to monitor your package.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}