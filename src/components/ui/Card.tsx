import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'elegant' | 'minimal' | 'gradient'
  hover?: boolean
  clickable?: boolean
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const variants = {
  default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
  glass: 'glass-card',
  elegant: 'card-elegant',
  minimal: 'card-minimal',
  gradient: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12'
}

const hoverClasses = 'hover-lift hover-glow'
const clickableClasses = 'cursor-pointer transform active:scale-95'

export default function Card({
  children,
  className,
  variant = 'default',
  hover = false,
  clickable = false,
  onClick,
  padding = 'md'
}: CardProps) {
  const Component = clickable || onClick ? motion.div : 'div'
  
  return (
    <Component
      onClick={onClick}
      className={cn(
        'rounded-2xl transition-all duration-300',
        variants[variant],
        paddingClasses[padding],
        hover && hoverClasses,
        (clickable || onClick) && clickableClasses,
        className
      )}
      whileHover={hover ? { y: -4 } : undefined}
      whileTap={(clickable || onClick) ? { scale: 0.98 } : undefined}
    >
      {children}
    </Component>
  )
}

// Card sub-components
export function CardHeader({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn('border-b border-gray-200 dark:border-gray-700 pb-4 mb-6', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ 
  children, 
  className,
  as: Component = 'h3'
}: { 
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}) {
  return (
    <Component className={cn('text-lg font-semibold text-gray-900 dark:text-white font-display', className)}>
      {children}
    </Component>
  )
}

export function CardSubtitle({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <p className={cn('text-sm text-gray-500 dark:text-gray-400 mt-1', className)}>
      {children}
    </p>
  )
}

export function CardContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn('text-gray-700 dark:text-gray-300', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn('border-t border-gray-200 dark:border-gray-700 pt-4 mt-6', className)}>
      {children}
    </div>
  )
}

// Specialized card components
export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon,
  className
}: {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ReactNode
  className?: string
}) {
  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-500 dark:text-gray-400'
  }

  return (
    <Card variant="glass" hover className={className}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {change && (
            <p className={cn('text-sm mt-1', changeColors[changeType])}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-600 dark:from-white dark:to-gray-300 rounded-xl flex items-center justify-center text-white dark:text-black">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}

export function ProductCard({ 
  image, 
  title, 
  price, 
  category, 
  isActive = true,
  onClick,
  className
}: {
  image: string
  title: string
  price: string
  category: string
  isActive?: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <Card 
      variant="glass" 
      hover 
      clickable={!!onClick} 
      onClick={onClick}
      padding="none"
      className={cn('overflow-hidden', !isActive && 'opacity-60', className)}
    >
      <div className="aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {category}
        </p>
        <h3 className="font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2">
          {title}
        </h3>
        <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
          {price}
        </p>
        {!isActive && (
          <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full mt-2">
            Inactive
          </span>
        )}
      </div>
    </Card>
  )
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  className
}: {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}) {
  return (
    <Card variant="glass" hover className={cn('text-center', className)}>
      <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-600 dark:from-white dark:to-gray-300 rounded-2xl flex items-center justify-center text-white dark:text-black mx-auto mb-4">
        {icon}
      </div>
      <CardTitle className="mb-2">{title}</CardTitle>
      <CardContent>
        <p className="text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}