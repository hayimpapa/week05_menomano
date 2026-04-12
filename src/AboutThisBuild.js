// ── About This Build ──
// Vanilla-JS "component": returns a DOM element ready to mount.

const REPO_NAME = 'week05_menomano';
const GITHUB_URL = `https://github.com/hayimpapa/${REPO_NAME}`;
const PROMPTS_URL = `${GITHUB_URL}/blob/main/PROMPTS.txt`;
const WEEK_NUMBER = 5;

export function createAboutThisBuild() {
  const root = document.createElement('div');
  root.className = 'about-inner';

  root.innerHTML = `
    <header class="about-header">
      <h1>About This Build</h1>
      <p class="about-subtitle">
        Week ${WEEK_NUMBER} of
        <strong>52 Apps in 52 Weeks Before I Turn 52</strong>
        by Hey I'm Papa
      </p>
    </header>

    <section class="about-card">
      <h2>THE PROBLEM</h2>
      <p>
        Classic arcade reflex games rarely celebrate charm. I wanted a bite-sized,
        one-thumb mobile game that kept the playful spirit of Osvaldo Cavandoli's
        <em>La Linea</em> — the grumpy little man walking an endless chalk line —
        and turned it into a quick reaction-test you can pick up in seconds.
        The challenge: keep Menő Manó walking, spot the obstacle in time, and
        tap the right tool before the line runs out.
      </p>
    </section>

    <section class="about-card">
      <h2>THE APP</h2>
      <p>
        Menő Manó – La Linea Runner is an endless runner rendered entirely on a
        single HTML5 canvas. Gaps, walls, boulders and birds scroll in from the
        right; you have a short action window to tap the matching move
        (Bridge, Ladder, Smash, or Duck). It's built with vanilla JavaScript,
        split into small modules (game loop, Manó renderer, obstacle renderers,
        input/state), and bundled with Vite. No runtime dependencies, touch and
        keyboard both supported, and three difficulty presets.
      </p>
    </section>

    <section class="about-card">
      <h2>GITHUB REPO</h2>
      <p>Browse the source, issues, and commit history.</p>
      <a class="about-btn-github"
         href="${GITHUB_URL}"
         target="_blank"
         rel="noopener noreferrer">
        View on GitHub
      </a>
    </section>
  `;

  return root;
}
