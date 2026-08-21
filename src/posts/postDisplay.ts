import { PostWithUser } from '@/posts/types';

export const STATUS_STYLES: Record<PostWithUser['status'], string> = {
  in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/10',
  planned: 'bg-purple-500/10 text-purple-500 border-purple-500/10',
  completed: 'bg-green-500/10 text-green-500 border-green-500/10',
  pending: 'bg-gray-500/10 text-gray-500 border-gray-500/10',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/10',
  closed: 'bg-blue-500/10 text-blue-500 border-blue-500/10',
};

export const STATUS_LABELS: Record<PostWithUser['status'], string> = {
  in_progress: 'In Progress',
  planned: 'Planned',
  completed: 'Completed',
  pending: 'Pending',
  rejected: 'Rejected',
  closed: 'Closed',
};

export const MODULE_LABELS: Record<string, string> = {
  feedback_portal: 'Feedback Portal',
  widgets: 'Widgets',
  changelog: 'Changelog',
  roadmap: 'Roadmap',
  help_center: 'Help Center',
  surveys: 'Surveys',
  other: 'Other',
};

export const INTEGRATION_LABELS: Record<string, string> = {
  new_integration: 'New integration',
  jira: 'Jira',
  linear: 'Linear',
  clickup: 'ClickUp',
  intercom: 'Intercom',
  zendesk: 'Zendesk',
  slack: 'Slack',
  discord: 'Discord',
  github: 'GitHub',
  hubspot: 'HubSpot',
  segment: 'Segment',
  azure_devops: 'Azure DevOps',
};

export const BUG_SOURCE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  widget: 'Widget',
  integration: 'Integration',
  api: 'API',
  other: 'Other',
};

export function formatStoredLabel(value: string, labels: Record<string, string>) {
  return labels[value] ?? value.replace(/_/g, ' ');
}
