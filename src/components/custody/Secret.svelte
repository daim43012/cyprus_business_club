<script lang="ts">
  import { onMount } from "svelte";

  let loading = true;
  let error: string | null = null;
  let secret: string | null = null;

  let revealed = false;
  let copied = false;

  async function loadSecret() {
    loading = true;
    error = null;

    try {
      const res = await fetch("/api/custody/secret", {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      secret = data.secret;
    } catch (e) {
      error = e instanceof Error ? e.message : "Unknown error";
      secret = null;
    } finally {
      loading = false;
    }
  }

  async function copySecret() {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      copied = false;
    }
  }

  onMount(() => {
    loadSecret();
  });
</script>

<div class="secret-card">
  {#if loading}
    <div class="state muted">Загрузка секрета...</div>
  {:else if error}
    <div class="state error">⚠️ {error}</div>
  {:else if secret}
    <div class="secret-box">
      <div class="secret-line">
        <code class="secret-code">
          {#if revealed}
            {secret}
          {:else}
            {"•".repeat(Math.min(secret.length, 40))}
          {/if}
        </code>

        <button
          class="icon-btn"
          aria-label="Toggle secret visibility"
          on:click={() => (revealed = !revealed)}
        >
          {#if revealed}
            <ion-icon name="eye-off-outline"></ion-icon>
          {:else}
            <ion-icon name="eye-outline"></ion-icon>
          {/if}
        </button>

        <!-- КОПИЯ -->
        <button class="icon-btn" on:click={copySecret} aria-label="Copy secret">
          <ion-icon name={copied ? "checkmark-done-outline" : "copy-outline"} />
        </button>
      </div>

      <!-- КНОПКИ РАСШИРЕНИЯ -->
      <div class="extension-btn-group">
        <a
          class="extension-btn"
          href="https://chromewebstore.google.com/detail/%D0%B0%D1%83%D1%82%D0%B5%D0%BD%D1%82%D0%B8%D1%84%D0%B8%D0%BA%D0%B0%D1%82%D0%BE%D1%80/bhghoamapcdpbohphigoooaddinpkbai"
          target="_blank"
          rel="noopener noreferrer"
        >
          Скачать Расширение
        </a>

        <a
          class="extension-btn secondary"
          href="https://authenticator.cc/docs/en/quickstart"
          target="_blank"
          rel="noopener noreferrer"
        >
          Инструкция
        </a>
      </div>

      <p class="hint">Не делитесь этим ключом. Он даёт доступ к кошельку.</p>
    </div>
  {:else}
    <div class="state muted">Секрет пустой.</div>
  {/if}
</div>

<style>
  .secret-card {
    background: #ffffff;
    border: 1px solid #e6edf3;
    border-radius: 14px;
    padding: 14px;
    width: 100%;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  }

  .title-row {
    margin-bottom: 10px;
  }

  h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: 0.2px;
  }

  .state {
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 14px;
  }

  .muted {
    color: #64748b;
    background: #f8fafc;
    border: 1px dashed #e2e8f0;
  }

  .error {
    color: #991b1b;
    background: #fff5f5;
    border: 1px solid #fecaca;
  }

  .secret-box {
    display: grid;
    gap: 10px;
  }

  .secret-line {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #f9fbfd;
    border: 1px solid #e6edf3;
    border-radius: 10px;
    padding: 10px 12px;
    overflow-x: auto;
  }

  .secret-code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      "Liberation Mono";
    font-size: 16px;
    letter-spacing: 0.3px;
    white-space: nowrap;
    color: #0f172a;
  }

  .icon-btn {
    background: none;
    border: none;
    color: #000000;
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    transition:
      color 0.2s,
      transform 0.15s;
    font-size: 1.3rem;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .icon-btn:hover {
    color: #0000007c;
  }

  .icon-btn ion-icon {
    font-size: 1.35rem;
  }

  /* Кнопки расширения */
  .extension-btn-group {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .extension-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    padding: 7px 12px;
    font-size: 13px;
    font-weight: 700;
    border-radius: 10px;

    border: 1px solid #000000;
    background: #ffffff;
    color: #0f172a;
    text-decoration: none;

    transition: 0.15s;
  }

  .extension-btn.secondary {
    background: #f8fafc;
  }

  .extension-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.06);
    background: #f8fafc;
  }

  .hint {
    margin: 2px 0 0;
    font-size: 12px;
    color: #64748b;
  }
</style>
