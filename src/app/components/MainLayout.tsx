import { ReactNode } from 'react';

import Header from './Header';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-[100dvh] w-[100dvw] flex flex-col">
      <Header />
      <div className="flex-1 min-h-0 w-full bg-accent/70 md:px-6 xl:px-0 px-4">
        <div className="max-w-5xl mt-8 mx-auto">{children}</div>
      </div>
    </div>
  );
}
