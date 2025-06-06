import { Link } from 'react-router-dom'

function NotFound() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link 
          to="/" 
          onClick={scrollToTop}
          className="inline-block text-black px-6 py-2 rounded-md transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound 