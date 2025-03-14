import { Link, useNavigate } from 'react-router-dom';

import { H1, H3, Lead } from '@/components/ui/typography';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-8">
      <div className="mb-8 text-primary w-40 h-40 sm:w-48 sm:h-48">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V8.5M13.5 3L19 8.5M13.5 3V7.5C13.5 8.05228 13.9477 8.5 14.5 8.5H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M10.5 13L13.5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.2 4.7C3.2 2.4 5.9 1.3 7.5 2.9L11.7 7.1C12.5 7.9 12.5 9.1 11.7 9.9C10.9 10.7 9.7 10.7 8.9 9.9L4.7 5.7C3.1 4.1 3.2 4.7 3.2 4.7Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <H1 className="mb-4 text-center">Page Not Found</H1>

      <Lead className="text-center max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved. Check the URL or head back to the home page.
      </Lead>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-border bg-card hover:bg-secondary transition-colors rounded-md text-foreground"
        >
          Go Back
        </button>

        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary hover:bg-primary/90 transition-colors rounded-md text-primary-foreground"
        >
          Return Home
        </button>
      </div>

      <div className="mt-12 border-t border-border pt-8 w-full max-w-md">
        <H3 className="mb-4 text-center">You might be looking for</H3>

        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/posts" className="text-primary hover:text-primary/90 transition-colors">
            Feedback
          </Link>
          <Link to="/roadmap" className="text-primary hover:text-primary/90 transition-colors">
            Roadmap
          </Link>
          <Link to="/changelog" className="text-primary hover:text-primary/90 transition-colors">
            Changelog
          </Link>
          <Link to="/help" className="text-primary hover:text-primary/90 transition-colors">
            Help Center
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
