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

  const roadmapDropdownItems: Tab['dropdownItems'] = [
    { label: 'Universal Roadmap', path: '/universal-roadmap' },
    { label: 'Feedback Roadmap', path: '/feedback-roadmap' },
    { label: 'Changelog Roadmap', path: '/changelog-roadmap' },
  ];

  const tabItems: Tab[] = [
    {
      icon: <FeedbackIcon />,
      label: boards.some((item) => item.path === activePath?.pathname) ? activePath?.title : 'Feedback',
      path: boards.find((item) => item.path === activePath?.pathname)?.path,
      dropdownItems: boards,
    },
    {
      icon: <RoadmapIcon />,
      label: roadmapDropdownItems.some((item) => item.path === activePath?.pathname) ? activePath?.title : 'Roadmap',
      path: roadmapDropdownItems.find((item) => item.path === activePath?.pathname)?.path,

      dropdownItems: roadmapDropdownItems,
    },
    {
      icon: <ChangelogIcon />,
      label: 'Changelog',
      path: '/changelog',
    },
    {
      icon: <HelpCenterIcon />,
      label: 'Help Center',
      path: 'https://help.featurebase.app',
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

const RoadmapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
    <path
      fillRule="evenodd"
      d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z"
      clipRule="evenodd"
    ></path>
  </svg>
);

const ChangelogIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
    <path d="M16.881 4.345A23.112 23.112 0 0 1 8.25 6H7.5a5.25 5.25 0 0 0-.88 10.427 21.593 21.593 0 0 0 1.378 3.94c.464 1.004 1.674 1.32 2.582.796l.657-.379c.88-.508 1.165-1.593.772-2.468a17.116 17.116 0 0 1-.628-1.607c1.918.258 3.76.75 5.5 1.446A21.727 21.727 0 0 0 18 11.25c0-2.414-.393-4.735-1.119-6.905ZM18.26 3.74a23.22 23.22 0 0 1 1.24 7.51 23.22 23.22 0 0 1-1.41 7.992.75.75 0 1 0 1.409.516 24.555 24.555 0 0 0 1.415-6.43 2.992 2.992 0 0 0 .836-2.078c0-.807-.319-1.54-.836-2.078a24.65 24.65 0 0 0-1.415-6.43.75.75 0 1 0-1.409.516c.059.16.116.321.17.483Z"></path>
  </svg>
);

const HelpCenterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
    <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z"></path>
  </svg>
);
