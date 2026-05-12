import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react' // temp

const MetricCard = ({ 
  title, 
  value, 
  change, 
  trend = 'up', 
  icon: Icon, 
  className 
}) => (
  <div className={cn(
    "group relative overflow-hidden rounded-xl border bg-card p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1",
    className
  )}>
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        <p className={cn(
          'text-sm font-medium',
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        )}>
          {change}
        </p>
      </div>
      <Icon className="h-12 w-12 text-primary opacity-75" />
    </div>
  </div>
)

export default MetricCard
