import { paths } from '@/lib/paths';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PostsBoardPath = Extract<(typeof paths)[number]['pathname'], `/posts${string}`>;

const BOARD_PATHS = paths
  .map(({ pathname }) => pathname)
  .filter((pathname): pathname is PostsBoardPath => pathname.startsWith('/posts'));

const BOARD_SLUGS = new Set(
  BOARD_PATHS.filter((pathname) => pathname !== '/posts').map((pathname) => {
    const parts = pathname.split('/');
    return parts[parts.length - 1]!;
  })
);

export function isPostId(value: string) {
  return UUID_RE.test(value);
}

export type ParsedPostsPath = {
  boardPath: PostsBoardPath;
  boardSlug: string | null;
  postId: string | null;
  isInvalid: boolean;
};

export function parsePostsPath(pathname: string): ParsedPostsPath {
  if (!pathname.startsWith('/posts')) {
    return { boardPath: '/posts', boardSlug: null, postId: null, isInvalid: true };
  }

  if (pathname === '/posts' || pathname === '/posts/') {
    return { boardPath: '/posts', boardSlug: null, postId: null, isInvalid: false };
  }

  const segments = pathname
    .replace(/^\/posts\/?/, '')
    .split('/')
    .filter(Boolean);

  if (segments.length === 1) {
    const segment = segments[0]!;

    if (isPostId(segment)) {
      return { boardPath: '/posts', boardSlug: null, postId: segment, isInvalid: false };
    }

    if (BOARD_SLUGS.has(segment)) {
      return { boardPath: `/posts/${segment}` as PostsBoardPath, boardSlug: segment, postId: null, isInvalid: false };
    }

    return { boardPath: '/posts', boardSlug: null, postId: null, isInvalid: true };
  }

  if (segments.length === 2) {
    const [slug, postId] = segments;

    if (slug && BOARD_SLUGS.has(slug) && postId && isPostId(postId)) {
      return {
        boardPath: `/posts/${slug}` as PostsBoardPath,
        boardSlug: slug,
        postId,
        isInvalid: false,
      };
    }
  }

  return { boardPath: '/posts', boardSlug: null, postId: null, isInvalid: true };
}

export function getPostPath(boardPath: PostsBoardPath, postId: string) {
  return `${boardPath}/${postId}`;
}

export function getPostLinkPath(pathname: string, postId: string) {
  const { boardPath } = parsePostsPath(pathname);
  return getPostPath(boardPath, postId);
}

export function getBoardSlugs() {
  return [...BOARD_SLUGS];
}
