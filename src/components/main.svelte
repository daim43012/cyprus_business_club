<script lang="ts">
  import EventsPreview from "./events-preview.svelte";
  import TestBlender from "./testBlender.svelte";
</script>

<main class="page">
  <!-- =========================
       Section 1: HERO
  ========================== -->
  <section class="hero">
    <div class="container heroGrid">
      <div class="heroLeft">
        <h1>Platform where business problems are solved faster</h1>

        <p>
          Find experts, launch projects and use AI tools — all in one place.
        </p>

        <div class="heroActions">
          <a class="btn btnPrimary" href="/login">Start for free</a>
          <a class="btn btnGhost" href="/brand/add">I’m an expert</a>
        </div>
      </div>

      <!-- Calm tech visual (CSS only) -->
      <div class="heroArt" aria-hidden="true">
        <div class="artGlow"></div>
        <div class="artGrid"></div>
        <div class="artLine l1"></div>
        <div class="artLine l2"></div>

        <div class="artCard">
          <div class="artChip">AI • Experts • Modules • Trust</div>
          <div class="artTitle">From task → to solution → to result</div>
          <div class="artText">Simple workflow, premium experience.</div>
        </div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- =========================
       Section 2: Key benefits
  ========================== -->
  <section class="section">
    <div class="container">
      <div class="sectionHead">
        <h2>Key benefits</h2>
        <p class="sub">Everything you need to go from idea to execution.</p>
      </div>

      <div class="grid4">
        <div class="card">
          <div class="icon">🔎</div>
          <h3>Fast expert matching</h3>
          <p>The right specialist in minutes, with verified expertise.</p>
        </div>

        <div class="card">
          <div class="icon">🤖</div>
          <h3>AI assistance</h3>
          <p>Briefs, suggestions and step-by-step guidance for your task.</p>
        </div>

        <div class="card">
          <div class="icon">⚡</div>
          <h3>Fast launch</h3>
          <p>Ready tech modules instead of long and expensive development.</p>
        </div>

        <div class="card">
          <div class="icon">🛡️</div>
          <h3>Safe work</h3>
          <p>Payments and agreements are protected inside the platform.</p>
        </div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- =========================
       Section 3: How it works (better, not скучно)
  ========================== -->
  <section class="section">
    <div class="container">
      <div class="sectionHead">
        <h2>How it works</h2>
        <p class="sub">A clear path from a task to a safe outcome.</p>
      </div>

      <div class="howGrid">
        <!-- Steps -->
        <div class="howSteps">
          <div class="howStep">
            <div class="badge">1</div>
            <div>
              <h3>Describe your task</h3>
              <p>Share goals, timeline and format — in a few lines.</p>
            </div>
          </div>

          <div class="howStep">
            <div class="badge">2</div>
            <div>
              <h3>AI shapes the solution</h3>
              <p>Structure, risks and next steps tailored to your needs.</p>
            </div>
          </div>

          <div class="howStep">
            <div class="badge">3</div>
            <div>
              <h3>We match experts or modules</h3>
              <p>Pick the best option: a person, a team or a ready module.</p>
            </div>
          </div>

          <div class="howStep">
            <div class="badge">4</div>
            <div>
              <h3>Launch and close the deal safely</h3>
              <p>Delivery and payment happen inside the trust layer.</p>
            </div>
          </div>
        </div>

        <!-- Result panel -->
        <div class="howPanel">
          <div class="panelTop">
            <div class="panelTitle">What you get</div>
            <div class="panelSub">Clear, structured, safe.</div>
          </div>

          <div class="panelList">
            <div class="panelItem">
              <span class="dot"></span>
              Task brief & scope
            </div>
            <div class="panelItem">
              <span class="dot"></span>
              Recommended plan & steps
            </div>
            <div class="panelItem">
              <span class="dot"></span>
              Expert / module selection
            </div>
            <div class="panelItem">
              <span class="dot"></span>
              Protected workflow & payment
            </div>
          </div>

          <div class="panelActions">
            <a class="btn btnPrimary" href="/signup">Create a task</a>
            <a class="btn btnGhost" href="/events">Explore events</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- =========================
       Section: Events
  ========================== -->
  <section class="section">
    <div class="container">
      <div class="sectionRow">
        <div>
          <h2>Events</h2>
          <p class="sub">Upcoming and latest events — join the community.</p>
        </div>
        <a class="btn btnGhost" href="/events">More events</a>
      </div>
    </div>

    <div class="container">
      <EventsPreview />
    </div>
  </section>

  <div class="divider"></div>

  <!-- =========================
       Section 4: For whom (better)
  ========================== -->
  <section class="section">
    <div class="container">
      <div class="sectionHead">
        <h2>Who this is for</h2>
        <p class="sub">Designed for people who value speed and clarity.</p>
      </div>

      <div class="grid5">
        <div class="roleCard">
          <div class="roleIcon">🏢</div>
          <div class="roleText">Entrepreneurs</div>
        </div>

        <div class="roleCard">
          <div class="roleIcon">🧑‍💻</div>
          <div class="roleText">Experts</div>
        </div>

        <div class="roleCard">
          <div class="roleIcon">🚀</div>
          <div class="roleText">Startups</div>
        </div>

        <div class="roleCard">
          <div class="roleIcon">👥</div>
          <div class="roleText">SMB teams</div>
        </div>

        <div class="roleCard">
          <div class="roleIcon">💡</div>
          <div class="roleText">Anyone launching a product or idea</div>
        </div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- =========================
       Section 5: Convenience (лучше)
  ========================== -->
  <section class="section">
    <div class="container">
      <div class="wideGrid">
        <div class="wideText">
          <h2>Why it’s convenient</h2>
          <p>
            We remove unnecessary steps between an idea and a result.
            You don’t jump across dozens of tools — everything needed to launch,
            collaborate and deliver is in one place.
          </p>
        </div>

        <div class="wideBullets">
          <div class="bullet">
            <span class="bIcon">✓</span>
            Less coordination overhead
          </div>
          <div class="bullet">
            <span class="bIcon">✓</span>
            Faster decisions with AI guidance
          </div>
          <div class="bullet">
            <span class="bIcon">✓</span>
            One platform instead of many services
          </div>
          <div class="bullet">
            <span class="bIcon">✓</span>
            Clear process from start to finish
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- =========================
       Section 6: Trust & tech
  ========================== -->
  <section class="section">
    <div class="container">
      <div class="sectionHead">
        <h2>Trust & technology</h2>
        <p class="sub">Premium layer that stays invisible — so it feels simple.</p>
      </div>

      <div class="grid4">
        <div class="card">
          <div class="icon">✨</div>
          <h3>AI supports every step</h3>
          <p>From task framing to final delivery.</p>
        </div>

        <div class="card">
          <div class="icon">✅</div>
          <h3>Expertise is verified</h3>
          <p>Profiles and skills are checked and transparent.</p>
        </div>

        <div class="card">
          <div class="icon">🔒</div>
          <h3>Protected trust layer</h3>
          <p>Work and payment happen in a secure environment.</p>
        </div>

        <div class="card">
          <div class="icon">🧠</div>
          <h3>Tech stays subtle</h3>
          <p>Complexity is hidden — you just get results.</p>
        </div>
      </div>

      <div class="bottomCta">
        <div>
          <h3 class="ctaTitle">Want to learn more?</h3>
          <p class="ctaText">Read about the platform, mission and how we build trust.</p>
        </div>
        <a class="btn btnPrimary" href="/about">Learn more about us</a>
      </div>
    </div>
  </section>
</main>
<TestBlender/>
<style>
  /* ===== typography (your base) ===== */
  h1 {
    font-size: 2.2rem;
    font-weight: 700;
    color: #0b3954;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.4rem;
    font-weight: 700;
    color: #0b3954;
    margin-bottom: 1rem;
  }

  p {
    color: #475569;
    line-height: 1.55;
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  /* ===== tokens / layout ===== */
  .page {
    --text: #0b3954;
    --muted: #475569;
    --border: #e5e7eb;
    --soft: #f8fafc;
    --primary: #0b3954;
    --radius: 18px;
  }

  .container {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 1.1rem;
  }

  /* more spacing between sections */
  .section {
    padding: 5.2rem 0;
  }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border), transparent);
  }

  .sub {
    margin-top: -0.4rem;
    margin-bottom: 0;
    color: var(--muted);
  }

  /* ===== Buttons (smaller) ===== */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    border-radius: 999px;
    padding: 0.52rem 0.85rem;
    font-weight: 600;
    font-size: 0.95rem;
    border: 1px solid var(--border);
    color: var(--text);
    background: #fff;
    transition: transform 0.2s ease, opacity 0.2s ease;
    white-space: nowrap;
  }

  .btn:hover {
    transform: translateY(-1px);
    opacity: 0.95;
  }

  .btnPrimary {
    background: var(--primary);
    border-color: var(--primary);
    color: #fff;
  }

  .btnGhost {
    background: #fff;
  }

  /* ===== HERO ===== */
  .hero {
    padding: 6.4rem 0 5.2rem 0;
  }

  .heroGrid {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: 2.2rem;
    align-items: center;
  }

  .heroActions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 0.35rem;
  }

  .heroArt {
    position: relative;
    min-height: 320px;
    border-radius: 24px;
    border: 1px solid var(--border);
    background: radial-gradient(1200px 500px at 20% 20%, #eef2ff 0%, #ffffff 50%),
      radial-gradient(800px 400px at 90% 90%, #e0f2fe 0%, #ffffff 55%);
    overflow: hidden;
  }

  .artGlow {
    position: absolute;
    inset: -40%;
    background: radial-gradient(circle at 40% 40%, rgba(99, 102, 241, 0.12), transparent 55%),
      radial-gradient(circle at 70% 70%, rgba(14, 165, 233, 0.12), transparent 55%);
    filter: blur(14px);
  }

  .artGrid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to right, rgba(11, 57, 84, 0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(11, 57, 84, 0.06) 1px, transparent 1px);
    background-size: 44px 44px;
    mask-image: radial-gradient(circle at 30% 30%, black 35%, transparent 70%);
    opacity: 0.9;
  }

  .artLine {
    position: absolute;
    height: 2px;
    width: 140%;
    left: -20%;
    background: linear-gradient(90deg, transparent, rgba(11, 57, 84, 0.18), transparent);
    transform: rotate(-12deg);
  }
  .artLine.l1 { top: 38%; }
  .artLine.l2 { top: 62%; opacity: 0.7; }

  .artCard {
    position: absolute;
    right: 18px;
    bottom: 18px;
    left: 18px;
    border-radius: 18px;
    border: 1px solid rgba(229, 231, 235, 0.9);
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(8px);
    padding: 1rem;
  }

  .artChip {
    display: inline-flex;
    padding: 0.3rem 0.6rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    font-size: 0.85rem;
    color: var(--muted);
    background: #fff;
    margin-bottom: 0.6rem;
  }

  .artTitle {
    font-weight: 700;
    color: var(--text);
    margin-bottom: 0.25rem;
  }

  .artText {
    color: var(--muted);
    font-size: 0.95rem;
  }

  /* ===== section header layouts ===== */
  .sectionHead {
    max-width: 900px;
    margin-bottom: 1.6rem;
  }

  .sectionRow {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.4rem;
  }

  /* ===== cards / grids ===== */
  .grid4 {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
  }

  .card {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem;
    background: #fff;
    transition: transform 0.25s ease;
  }

  .card:hover {
    transform: translateY(-3px);
  }

  .icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: var(--soft);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.8rem;
    font-size: 1.1rem;
  }

  .card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text);
  }

  .card p {
    margin: 0;
  }

  /* ===== How it works (improved) ===== */
  .howGrid {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 1.2rem;
    align-items: start;
  }

  .howSteps {
    display: grid;
    gap: 0.9rem;
  }

  .howStep {
    display: grid;
    grid-template-columns: 54px 1fr;
    gap: 0.9rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: #fff;
    transition: transform 0.25s ease;
  }

  .howStep:hover {
    transform: translateY(-3px);
  }

  .badge {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: var(--soft);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: var(--text);
  }

  .howStep h3 {
    margin: 0 0 0.35rem 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text);
  }

  .howStep p {
    margin: 0;
  }

  .howPanel {
    border: 1px solid var(--border);
    border-radius: 22px;
    background:
      radial-gradient(900px 400px at 30% 20%, #eef2ff 0%, #ffffff 55%),
      radial-gradient(700px 360px at 80% 90%, #e0f2fe 0%, #ffffff 60%);
    overflow: hidden;
    padding: 1rem;
  }

  .panelTop {
    margin-bottom: 0.9rem;
  }

  .panelTitle {
    font-weight: 700;
    color: var(--text);
    margin-bottom: 0.25rem;
  }

  .panelSub {
    color: var(--muted);
    font-size: 0.95rem;
  }

  .panelList {
    display: grid;
    gap: 0.6rem;
    margin: 1rem 0 1.1rem 0;
  }

  .panelItem {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.7rem 0.75rem;
    border-radius: 16px;
    border: 1px solid rgba(229, 231, 235, 0.9);
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(8px);
    color: var(--text);
    font-weight: 600;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: rgba(11, 57, 84, 0.45);
  }

  .panelActions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  /* ===== Who this is for ===== */
  .grid5 {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0.9rem;
  }

  .roleCard {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: #fff;
    padding: 1rem;
    transition: transform 0.25s ease;
    display: grid;
    gap: 0.6rem;
    align-content: start;
  }

  .roleCard:hover {
    transform: translateY(-3px);
  }

  .roleIcon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: var(--soft);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .roleText {
    font-weight: 700;
    color: var(--text);
  }

  /* ===== Convenience ===== */
  .wideGrid {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 1.2rem;
    align-items: start;
  }

  .wideText {
    max-width: 760px;
  }

  .wideBullets {
    border: 1px solid var(--border);
    border-radius: 22px;
    background: #fff;
    padding: 1rem;
    display: grid;
    gap: 0.65rem;
  }

  .bullet {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.7rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 16px;
    background: var(--soft);
    font-weight: 600;
    color: var(--text);
    transition: transform 0.25s ease;
  }

  .bullet:hover {
    transform: translateY(-3px);
  }

  .bIcon {
    width: 22px;
    height: 22px;
    border-radius: 999px;
    background: rgba(11, 57, 84, 0.1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: var(--text);
  }

  /* ===== bottom CTA ===== */
  .bottomCta {
    margin-top: 2rem;
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 1.2rem;
    background: var(--soft);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .ctaTitle {
    margin: 0 0 0.35rem 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text);
  }

  .ctaText {
    margin: 0;
    color: var(--muted);
  }

  /* ===== responsive ===== */
  @media (max-width: 980px) {
    .heroGrid {
      grid-template-columns: 1fr;
    }
    .heroArt {
      min-height: 260px;
    }
    .grid4 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .howGrid {
      grid-template-columns: 1fr;
    }
    .grid5 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .wideGrid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .grid4,
    .grid5 {
      grid-template-columns: 1fr;
    }
  }
</style>
