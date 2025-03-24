import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'sm:text-[15px] min-h-[70px] max-h-[170px] field-sizing-content w-full resize-none pr-32 dark:bg-transparent custom-scrollbar border-transparent dark:border-transparent bg-transparent pt-[36px] pb-3 rounded-none border-x-0 dark:text-white focus-within:outline-none focus-within:ring-0 dark:focus-within:outline-non',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
