import { Link, useNavigate } from 'react-router-dom';

import NotFoundIcon from '@/assets/icons/not-found.svg';
import { H1, H3, Lead } from '@/components/ui/typography';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-8">
      <div className="mb-8 text-primary w-40 h-40 sm:w-48 sm:h-48">
        <NotFoundIcon />
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
