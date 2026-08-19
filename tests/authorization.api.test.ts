import { randomUUID } from 'node:crypto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { Database } from '../database.types';
import { loadLocalSupabaseEnv } from './loadLocalSupabaseEnv';

const local = loadLocalSupabaseEnv();

const password = 'correct-horse-8';

describe.skipIf(!local)('Data API authorization', () => {
  const suffix = randomUUID();
  const aliceEmail = `alice-${suffix}@test.local`;
  const bobEmail = `bob-${suffix}@test.local`;

  let admin: SupabaseClient<Database>;
  let alice: SupabaseClient<Database>;
  let bob: SupabaseClient<Database>;
  let anon: SupabaseClient<Database>;
  let aliceId: string;
  let bobId: string;
  let boardId: string;
  let alicePostId: string;

  beforeAll(async () => {
    if (!local) return;

    admin = createClient<Database>(local.url, local.secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    anon = createClient<Database>(local.url, local.publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    alice = createClient<Database>(local.url, local.publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    bob = createClient<Database>(local.url, local.publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const createdAlice = await admin.auth.admin.createUser({
      email: aliceEmail,
      password,
      email_confirm: true,
      user_metadata: { username: 'alice' },
    });
    const createdBob = await admin.auth.admin.createUser({
      email: bobEmail,
      password,
      email_confirm: true,
      user_metadata: { username: 'bob' },
    });

    if (createdAlice.error || !createdAlice.data.user) {
      throw createdAlice.error ?? new Error('Failed to create alice');
    }
    if (createdBob.error || !createdBob.data.user) {
      throw createdBob.error ?? new Error('Failed to create bob');
    }

    aliceId = createdAlice.data.user.id;
    bobId = createdBob.data.user.id;

    const board = await admin.from('boards').insert({ name: 'API tests', value: `api-${suffix}` }).select('id').single();
    if (board.error || !board.data) {
      throw board.error ?? new Error('Failed to create board');
    }
    boardId = board.data.id;

    const aliceSession = await alice.auth.signInWithPassword({ email: aliceEmail, password });
    const bobSession = await bob.auth.signInWithPassword({ email: bobEmail, password });
    if (aliceSession.error) throw aliceSession.error;
    if (bobSession.error) throw bobSession.error;
  });

  afterAll(async () => {
    if (!local) return;
    if (aliceId) await admin.auth.admin.deleteUser(aliceId);
    if (bobId) await admin.auth.admin.deleteUser(bobId);
  });

  it('blocks anonymous reads of forum tables', async () => {
    const posts = await anon.from('posts').select('id');
    expect(posts.data).toBeNull();
    expect(posts.error?.code).toBe('42501');
  });

  it('lets alice create a post owned by her session, not by a forged user_id', async () => {
    const created = await alice
      .from('posts')
      .insert({ board: boardId, title: 'Alice API post', description: 'hello' })
      .select('id, user_id')
      .single();

    expect(created.error).toBeNull();
    expect(created.data?.user_id).toBe(aliceId);
    alicePostId = created.data!.id;

    const forged = await alice.from('posts').insert({
      board: boardId,
      title: 'Stolen',
      description: 'nope',
      user_id: bobId,
    });

    expect(forged.error).toBeTruthy();
  });

  it('rejects protected column updates and edits to another user post', async () => {
    const statusUpdate = await alice.from('posts').update({ status: 'closed' }).eq('id', alicePostId);
    expect(statusUpdate.error).toBeTruthy();

    const hijack = await bob.from('posts').update({ title: 'Hacked' }).eq('id', alicePostId).select('id');
    expect(hijack.error).toBeNull();
    expect(hijack.data).toEqual([]);

    const stillAlice = await alice.from('posts').select('title, status').eq('id', alicePostId).single();
    expect(stillAlice.data?.title).toBe('Alice API post');
    expect(stillAlice.data?.status).toBe('pending');
  });

  it('rejects duplicate votes and only deletes the caller vote', async () => {
    const first = await alice.from('votes').insert({ post_id: alicePostId });
    expect(first.error).toBeNull();

    const duplicate = await alice.from('votes').insert({ post_id: alicePostId });
    expect(duplicate.error).toBeTruthy();

    const bobVote = await bob.from('votes').insert({ post_id: alicePostId });
    expect(bobVote.error).toBeNull();

    const bobDeletesAlice = await bob.from('votes').delete().eq('post_id', alicePostId).eq('user_id', aliceId);
    expect(bobDeletesAlice.error).toBeNull();

    const remaining = await admin.from('votes').select('user_id').eq('post_id', alicePostId);
    const voters = (remaining.data ?? []).map((row) => row.user_id).sort();
    expect(voters).toEqual([aliceId, bobId].sort());

    const bobDeletesOwn = await bob.from('votes').delete().eq('post_id', alicePostId).eq('user_id', bobId);
    expect(bobDeletesOwn.error).toBeNull();

    const after = await admin.from('votes').select('user_id').eq('post_id', alicePostId);
    expect(after.data?.map((row) => row.user_id)).toEqual([aliceId]);
  });

  it('hides emails on posts_with_users and blocks privileged rpcs for anon', async () => {
    const preview = await alice.from('posts_with_users').select('user').eq('id', alicePostId).single();
    expect(preview.error).toBeNull();
    expect(preview.data?.user).toMatchObject({ username: 'alice' });
    expect(preview.data?.user).not.toHaveProperty('email');

    const rpc = await anon.rpc('get_post_user', { post_id: alicePostId });
    expect(rpc.error).toBeTruthy();
  });
});
