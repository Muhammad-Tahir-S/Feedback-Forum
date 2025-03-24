import { ChevronDown } from 'lucide-react';
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

import ChangelogIcon from '@/assets/icons/changelog.svg';
import FeedbackIcon from '@/assets/icons/feedback.svg';
import HelpCenterIcon from '@/assets/icons/help-center.svg';
import RoadmapIcon from '@/assets/icons/roadmap.svg';
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
  const { pathname } = useLocation();
  const activePathname = pathname;
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
  const { search } = useLocation();

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
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 ml-1 sm:w-5 sm:h-5',
                      activePathname === tab.path ? tabIconActiveStyles : tabIconInactiveStyles
                    )}
                  />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={0} align="start">
                {tab.dropdownItems?.map((item, index) => (
                  <Link
                    key={index}
                    to={{
                      pathname: item.path,
                      search: search,
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
