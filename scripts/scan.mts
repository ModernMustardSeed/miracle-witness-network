/**
 * Runs one scan from the terminal and prints the edition it would publish.
 *
 *   pnpm scan            full pass, GDELT and the model, writes to the store
 *   pnpm scan:dry        same pass, prints only, writes nothing
 *   pnpm scan -- --fast  feeds only, no GDELT
 *   pnpm scan -- --rules keyword pass only, no model, no tokens spent
 */
import { loadEnv } from '../lib/env';
import { runScan } from '../lib/scan';
import { isPersisted, store } from '../lib/store';

// Every consumer reads process.env inside a function, never at module load, so
// filling it here is early enough.
loadEnv();

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const includeGdelt = !args.includes('--fast');
  const useClaude = !args.includes('--rules');

  console.log(
    `\nScanning. GDELT ${includeGdelt ? 'on' : 'off'}, editor ${useClaude ? 'on' : 'off'}, archive ${
      isPersisted() ? 'supabase' : 'in memory'
    }.\n`,
  );

  const started = Date.now();
  const result = await runScan({ includeGdelt, useClaude });

  for (const story of result.stories.slice(0, 25)) {
    console.log(
      `  [${story.desk.padEnd(9)}] ${story.headline}\n      ${story.sourceName} · ${
        story.place ?? 'place unknown'
      } · weight ${story.weight} · ${story.corroborations} outlet(s) · ${story.reviewedBy}`,
    );
  }

  console.log(
    `\n${result.run.itemsSeen} items read, ${result.stories.length} kept, ${result.run.sourcesOk} sources answering, ${result.run.sourcesFailed} not. ${(
      (Date.now() - started) /
      1000
    ).toFixed(1)}s.`,
  );

  for (const warning of result.warnings) console.log(`  warn: ${warning}`);

  if (!dry) {
    const saved = await store().saveStories(result.stories);
    await store().saveRun(result.run);
    console.log(`\nSaved ${saved} stories.`);
  } else {
    console.log('\nDry run. Nothing was written.');
  }
  console.log('');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
