import { ComponentProps } from 'react';

import SearchDropdownContent from '../components/CreatePostButton/SearchDropdownContent';

type DropdownItem = ComponentProps<typeof SearchDropdownContent>['items'][number];

export const moduleOptions: DropdownItem[] = [
  { label: 'Feedback Portal', value: 'feedback_portal' },
  { label: 'Widgets', value: 'widgets' },
  { label: 'Changelog', value: 'changelog' },
  { label: 'Roadmap', value: 'roadmap' },
  { label: 'Help Center', value: 'help_center' },
  { label: 'Surveys', value: 'surveys' },
  { label: 'Other', value: 'other' },
];

export const integrationOptions: DropdownItem[] = [
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

export const badgeOptions = ['Dashboard', 'Widget', 'Integration', 'API', 'Other'].map((opt) => ({
  label: opt,
  value: opt.toLocaleLowerCase(),
}));
