import { ReactNode } from 'react';

import Header from './Header';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-[100dvh] w-[100dvw] flex flex-col">
      <Header />
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
