import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-7xl font-black text-primary-100 dark:text-primary-900">404</p>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p className="text-slate-500 dark:text-slate-400">The page you're looking for doesn't exist.</p>
      <Link to="/"><Button>Back to store</Button></Link>
    </main>
  )
}
