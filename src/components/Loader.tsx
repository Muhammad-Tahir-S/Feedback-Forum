export default function Loader() {
  return (
    <div className="mt-16">
      <div>
        <div className="flex items-center justify-center mt-4 pb-7">
          <div className="w-6 h-6 secondary-svg">
            <svg
              className="inherit-width inherit-height animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid"
              style={{ maxHeight: '28px', maxWidth: '28px' }}
            >
              <circle
                cx="50"
                cy="50"
                r="32"
                strokeWidth="8"
                stroke="currentColor"
                strokeDasharray="50.26548245743669 50.26548245743669"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
