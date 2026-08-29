/**
 * Probes every configured source and prints what actually answered.
 * Run it before trusting a scan:  pnpm sources:check
 */
import { loadEnv } from '../lib/env';
import { GDELT_QUERIES, fetchGdelt } from '../lib/sources/gdelt';
import { FEEDS, fetchFeed } from '../lib/sources/rss';

loadEnv();

const pad = (value: string, width: number) => value.padEnd(width).slice(0, width);

async function main() {
  const withGdelt = !process.argv.includes('--feeds-only');
  let ok = 0;
  let failed = 0;

  console.log('\nFEEDS');
  for (const feed of FEEDS) {
    try {
      const items = await fetchFeed(feed);
      ok += 1;
      console.log(`  ok   ${pad(feed.name, 26)} ${String(items.length).padStart(3)} items`);
    } catch (error) {
      failed += 1;
      console.log(
        `  FAIL ${pad(feed.name, 26)} ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  if (withGdelt) {
    console.log('\nGDELT');
    for (const query of GDELT_QUERIES) {
      try {
        const items = await fetchGdelt(query, { maxRecords: 5 });
        ok += 1;
        console.log(`  ok   ${pad(query.label, 26)} ${String(items.length).padStart(3)} items`);
      } catch (error) {
        failed += 1;
        console.log(
          `  FAIL ${pad(query.label, 26)} ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  console.log(`\n${ok} answering, ${failed} not.\n`);
  process.exitCode = failed > 0 ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
