import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getShowById, SHOWS } from '../src/utils/showRegistry.ts';

test('Time Capsule is registered for its page, schedule, Zeno stream, and notifications', () => {
  const show = getShowById('time-capsule');

  assert.ok(show);
  assert.equal(show.href, '/dashboard/time-capsule');
  assert.deepEqual(show.hosts, ['Amanda', 'Mark']);
  assert.deepEqual(show.schedule, {
    day: 'Every Other Sunday',
    time: '4:00 PM ET',
  });
  assert.deepEqual(show.supportedLivePlatforms, ['manual', 'zeno']);
  assert.equal(show.notification.url, show.href);
  assert.equal(show.notification.title, 'Time Capsule is live');
});

test('show registry identifiers and destinations are unique', () => {
  for (const field of ['id', 'slug', 'href'] as const) {
    const values = SHOWS.map((show) => show[field]);
    assert.equal(new Set(values).size, values.length, `Duplicate show ${field}`);
  }
});
