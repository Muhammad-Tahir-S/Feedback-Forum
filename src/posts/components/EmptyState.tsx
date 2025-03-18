import CreatePostButton from './CreatePostButton';

export default function EmptyState() {
  return (
    <div className="mt-4 -mx-4 overflow-hidden rounded-none border-x-0 sm:border-x sm:rounded-lg sm:mx-0 border-accent bg-secondary/80 border-y">
      <div className="w-full divide-y dark:divide-border divide-gray-100/60">
        <div className="px-4 pb-16 mx-auto">
          <div className="w-full">
            <div className="relative flex flex-col items-center justify-center mt-8 mb-12 space-y-6">
              <div className="flex flex-col items-center justify-center text-center">
                <h2 className="pt-12 font-semibold text-white">No Submissions Yet</h2>
                <p className="max-w-xs mt-2 text-gray-400 dark:text-foreground">
                  If you would like to say something click the button below to join the conversation.
                </p>
                <CreatePostButton />
              </div>
            </div>

            <div className="relative max-w-md mx-auto mb-6 space-y-6 overflow-hidden">
              <div className="relative flex items-end w-full p-5 border rounded-lg shadow-lg border-accent bg-secondary/80">
                <div>
                  <div className="h-5 rounded-md w-52 bg-gray-500/10 dark:bg-border"></div>
                  <div className="h-5 mt-3 rounded-md w-36 bg-gray-500/10 dark:bg-border/70"></div>
                </div>
                <div className="flex ml-auto">
                  <div className="relative w-6 h-6 rounded-full bg-gradient-to-b from-blue-600 to-sky-400"></div>
                </div>
              </div>

              <div className="relative flex items-end w-full p-5 border rounded-lg shadow-lg border-accent bg-secondary/80">
                <div>
                  <div className="h-5 rounded-md w-28 bg-gray-500/10 dark:bg-border"></div>
                  <div className="h-5 mt-3 rounded-md w-52 bg-gray-500/10 dark:bg-border/70"></div>
                </div>
                <div className="flex ml-auto">
                  <div className="relative w-6 h-6 rounded-full bg-gradient-to-b from-emerald-600 to-emerald-400"></div>
                </div>
              </div>

              <div className="relative flex items-end w-full p-5 border rounded-lg shadow-lg border-accent bg-secondary/80">
                <div>
                  <div className="w-40 h-5 rounded-md bg-gray-500/10 dark:bg-border"></div>
                  <div className="h-5 mt-3 rounded-md w-28 bg-gray-500/10 dark:bg-border/70"></div>
                </div>
                <div className="flex ml-auto">
                  <div className="relative w-6 h-6 rounded-full bg-gradient-to-b from-purple-600 to-fuchsia-400"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
