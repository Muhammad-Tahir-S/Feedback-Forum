import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useGetBoardItems from '@/hooks/useGetBoardItems';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';

type Path = (typeof paths)[number];
type Tab = {
  icon: ReactNode;
  label?: (string & {}) | Path['title'];
  path?: Path['pathname'];
  dropdownItems?: { label: (string & {}) | Path['title']; path: Path['pathname']; icon?: ReactNode; id?: string }[];
  isExternalLink?: boolean;
};

export default function Navbar() {
  const location = useLocation();
  const activePathname = location.pathname;
  const activePath = paths.find(({ pathname }) => pathname === activePathname);

  const { boards } = useGetBoardItems();

  const tabItems: Tab[] = [
    {
      icon: <FeedbackIcon />,
      label: boards.some((item) => item.path === activePath?.pathname) ? activePath?.title : 'Feedback',
      path: boards.find((item) => item.path === activePath?.pathname)?.path,
      dropdownItems: boards,
    },
  ];

  const tabs = tabItems.map((item) => ({
    ...item,
    isExternalLink: paths?.find((path) => path.pathname === item?.path)?.isExternalLink,
  }));

  return <NavTabs tabs={tabs} activePathname={activePathname} />;
}

export function NavTabs({ tabs, activePathname }: { tabs: Tab[]; activePathname: string }) {
  return (
    <div className={cn('flex items-center mt-4 -mb-px space-x-1 overflow-x-auto scrollbar-none sm:space-x-5')}>
      {tabs.map((tab) => (
        <div key={`${tab.path}_${tab.label}`} className="relative flex-shrink-0">
          {tab?.dropdownItems?.length ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger
                className={cn(
                  tabTriggerBaseStyles,
                  activePathname === tab.path ? tabTriggerActiveStyles : tabTriggerInactiveStyles
                )}
              >
                <span
                  className={cn(
                    tabIconBaseStyles,
                    activePathname === tab.path ? tabIconActiveStyles : tabIconInactiveStyles
                  )}
                >
                  {tab.icon}
                </span>
                {typeof tab.label === 'string' ? (
                  <span className="truncate max-w-[220px]">{tab.label}</span>
                ) : (
                  tab.label
                )}
                {tab?.dropdownItems?.length && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={cn(
                      'w-4 h-4 ml-1 sm:w-5 sm:h-5',
                      activePathname === tab.path ? tabIconActiveStyles : tabIconInactiveStyles
                    )}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={0} align="start">
                {tab.dropdownItems?.map((item, index) => (
                  <Link
                    key={index}
                    to={{
                      pathname: item.path,
                      search: location.search,
                    }}
                  >
                    <DropdownMenuItem>
                      <span className="flex items-center space-x-2">
                        {item.icon && <span>{item.icon}</span>}
                        <span>{item.label}</span>
                      </span>
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to={tab.path as string}
              target={tab.isExternalLink ? '_blank' : undefined}
              rel={tab.isExternalLink ? 'noreferrer' : undefined}
              className={cn(
                tabTriggerBaseStyles,
                activePathname === tab.path ? tabTriggerActiveStyles : tabTriggerInactiveStyles,
                tab.isExternalLink && 'sm:pr-[10px]'
              )}
            >
              <span
                className={cn(
                  tabIconBaseStyles,
                  activePathname === tab.path ? tabIconActiveStyles : tabIconInactiveStyles
                )}
              >
                {tab.icon}
              </span>
              {typeof tab.label === 'string' ? <span className="truncate max-w-[220px]">{tab.label}</span> : tab.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

const tabTriggerBaseStyles =
  'flex items-center outline-none border border-b-0 font-medium text-sm sm:text-[15px] py-2.5 px-1.5 sm:px-2 transition-all duration-300 cursor-pointer rounded-t-[0.5rem] rounded-b-none';
const tabTriggerActiveStyles = 'text-foreground bg-[#0D192C]  border-accent  shadow-none';
const tabTriggerInactiveStyles = 'text-foreground/80 border-transparent hover:border-accent  hover:bg-[#0D192C]';
const tabIconBaseStyles = 'w-4 h-4 mr-1 sm:w-5 sm:h-5';
const tabIconActiveStyles = 'text-primary';
const tabIconInactiveStyles = 'text-primary/70';

const FeedbackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
  </svg>
);
