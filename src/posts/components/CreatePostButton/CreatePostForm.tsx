import { DialogTitle } from '@radix-ui/react-dialog';
import { ChevronRight, X } from 'lucide-react';
import { ComponentProps, useState } from 'react';

import { feedbackDropdownItems } from '@/app/components/Navbar';
import UserAvatar from '@/components/Avatar';
import ProseMirrorEditor from '@/components/ProseMirroEditor';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import SearchDropdownContent from './SearchDropdownContent';
import SelectDropdown from './SelectDropdown';

type DropdownItem = ComponentProps<typeof SearchDropdownContent>['items'][number];

export default function CreatePostForm({ onClose }: { onClose: VoidFunction }) {
  const [title, setTitle] = useState('');
  const [_content, setContent] = useState('');
  const [selectedBugSources, setSelectedBugSources] = useState<string[] | null>(null);

  const [selectedBoard, setSelectedBoard] = useState<DropdownItem | null>(
    boardOptions.find((opt) => opt.label === 'Feature request') || null
  );
  const [selectedModule, setSelectedModule] = useState<DropdownItem | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<DropdownItem | null>(null);

  return (
    <div>
      <div className="w-full px-4 pt-4 pb-2 flex justify-between items-center">
        <DialogTitle className="hidden">Create Post</DialogTitle>
        <div className="flex items-center">
          <UserAvatar />
          <ChevronRight className="w-4 h-4 mx-1.5 text-muted-foreground" />

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                className="text-xs h-7 font-medium px-1.5 py-1 rounded-md flex items-center bg-border hover:bg-primary/40 text-gray-400 hover:text-foreground transition-all cursor-pointer"
                type="button"
              >
                <span className="mr-1 -ml-[2px]">
                  <div role="img" aria-label="Featured icon">
                    <span className="">{boardOptions.find((opt) => opt.value === selectedBoard?.value)?.icon}</span>
                  </div>
                </span>
                {selectedBoard?.label}
              </button>
            </DropdownMenuTrigger>

            <SearchDropdownContent
              items={boardOptions}
              onSelect={(item) => {
                setSelectedBoard(item);
                setSelectedModule(null);
                setSelectedIntegration(null);
                setSelectedBugSources(null);
              }}
              contentProps={{ side: 'left', align: 'start' }}
              noItemMessage="No board found"
              searchInputPlaceholder="Search board..."
            />
          </DropdownMenu>
        </div>
        <button className="p-1 bg-transparent hover:bg-muted rounded-md" onClick={onClose}>
          <X className="w-4.5 h-4.5 cursor-pointer text-muted-foreground" />
        </button>
      </div>

      <div className="relative mt-1 z-[50] px-1">
        <input
          id="create-post-title"
          className="text-base font-medium bg-transparent border-0 w-full text-foreground sm:text-lg focus:outline-none focus:ring-0 px-4 py-2"
          placeholder="Title of your post"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="px-1 mb-1">
        <ProseMirrorEditor placeholder="Post description..." onChange={setContent} />
      </div>

      {selectedBoard?.label === 'Bugs' ? (
        <>
          <div className="relative z-[50] py-3.5 px-4 bg-popover border-t border-accent">
            <p className="pr-20 text-sm font-medium text-gray-400 dark:text-foreground">
              What is experiencing an issue?
            </p>
            <div className="flex flex-wrap mt-3 gap-2.5">
              {badgeOptions.map(({ value, label }) => (
                <BugBadge
                  key={value}
                  value={value}
                  label={label}
                  onSelect={(val) =>
                    setSelectedBugSources((prev) =>
                      prev?.includes(val) ? prev.filter((src) => src !== val) : [...(prev || []), val]
                    )
                  }
                  isSelected={(selectedBugSources || [])?.some((src) => src === value)}
                />
              ))}
            </div>
          </div>

          <div className="relative z-[50] py-3.5 px-4 bg-popover border-t border-accent">
            <p className="pointer-events-none absolute text-xs font-medium text-gray-400 dark:text-foreground">
              Environment?
            </p>
            <textarea
              id="environment"
              className="sm:text-[15px] min-h-[70px] max-h-[170px] field-sizing-content w-full resize-none pr-32 dark:bg-transparent custom-scrollbar border-transparent dark:border-transparent bg-transparent pt-[36px] pb-3 rounded-none border-x-0 dark:text-white focus-within:outline-none focus-within:ring-0 dark:focus-within:outline-none"
              placeholder="Which browser and device?"
            ></textarea>
            <div className="absolute top-2.5 pointer-events-none right-5">
              <span className="border py-0.5 px-1 rounded-sm border-accent text-background-accent/70 shadow-sm bg-white/5 dark:text-foreground/60 text-[11px] font-medium tracking-wide">
                Text <span className="opacity-80">(Optional)</span>
              </span>
            </div>
          </div>
        </>
      ) : (
        <>
          {selectedBoard?.label === 'Integrations' ? (
            <SelectDropdown
              selectedItem={selectedIntegration}
              label="Which integration?"
              items={integrationOptions}
              onSelect={(item) => setSelectedIntegration(item)}
              contentProps={{ side: 'bottom', align: 'start' }}
            />
          ) : null}

          <SelectDropdown
            selectedItem={selectedModule}
            label="To which module does this apply to?"
            items={moduleOptions}
            onSelect={(item) => setSelectedModule(item)}
            contentProps={{ side: 'bottom', align: 'start' }}
          />
        </>
      )}

      <div className="flex items-center justify-between gap-5 px-4 py-4 ml-auto border-t dark:border-white/5">
        <div className="flex items-center flex-shrink-0 gap-5 ml-auto">
          {/* <div className="items-center text-xs gap-2.5 hidden sm:flex">
            <Switch
              id="create-more"
              checked={createMore}
              onCheckedChange={setCreateMore}
              className="peer h-[16px] w-[28px] data-[state=checked]:bg-accent data-[state=unchecked]:bg-gray-100/60 dark:data-[state=unchecked]:bg-border"
            />
            <label htmlFor="create-more" className="select-none text-background-accent/80 dark:text-foreground/90">
              Create more
            </label>
          </div> */}
          <Button size="sm" className="text-xs text-primary-foreground">
            Submit Post
          </Button>
        </div>
      </div>
    </div>
  );
}

const boardOptions = feedbackDropdownItems
  .filter((item) => item.path !== '/posts')
  .map((item) => ({
    label: item.label,
    icon: item.icon,
    value: item.label.toLocaleLowerCase().split(' ').join('_'),
  }));

const moduleOptions: DropdownItem[] = [
  { label: 'Feedback Portal', value: 'feedback_portal' },
  { label: 'Widgets', value: 'widgets' },
  { label: 'Changelog', value: 'changelog' },
  { label: 'Roadmap', value: 'roadmap' },
  { label: 'Help Center', value: 'help_center' },
  { label: 'Surveys', value: 'surveys' },
  { label: 'Other', value: 'other' },
];

const integrationOptions: DropdownItem[] = [
  { label: 'New integration', value: 'new_integration' },
  { label: 'Jira', value: 'jira' },
  { label: 'Linear', value: 'linear' },
  { label: 'ClickUp', value: 'clickup' },
  { label: 'Intercom', value: 'intercom' },
  { label: 'Zendesk', value: 'zendesk' },
  { label: 'Slack', value: 'slack' },
  { label: 'Discord', value: 'discord' },
  { label: 'GitHub', value: 'github' },
  { label: 'HubSpot', value: 'hubspot' },
  { label: 'Segment', value: 'segment' },
  { label: 'Azure DevOps', value: 'azure_devops' },
];

function BugBadge({
  label,
  value,
  onSelect,
  isSelected,
}: {
  label: string;
  value: string;
  onSelect: (val: string) => void;
  isSelected: boolean;
}) {
  return (
    <button
      className={cn(
        'text-xs h-7 font-medium px-1.5 py-1 rounded-md flex items-center   transition-all cursor-pointer duration-300',
        isSelected ? 'bg-primary hover:bg-primary/80 text-foreground' : 'bg-border hover:bg-accent text-gray-300'
      )}
      type="button"
      onClick={() => onSelect(value)}
    >
      <span className="mr-1 -ml-[2px]">
        <div role="img" aria-label="Featured icon">
          <span className="">{boardOptions.find((opt) => opt.value === value)?.icon}</span>
        </div>
      </span>
      {label}
    </button>
  );
}

const badgeOptions = ['Dashboard', 'Widget', 'Integration', 'API', 'Other'].map((opt) => ({
  label: opt,
  value: opt.toLocaleLowerCase(),
}));
