<script lang="ts">
  import { tick, onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { marked } from "marked";

  export let contextKey:
    | "global"
    | "event"
    | "expert"
    | "member"
    | "custody"
    | "custom"
    | "brand"
    | "brand_unified"
    | "brand_create" = "global";

  export let payload: any = {};
  export let title = "AI помощник";

  export let fabRight = 18;
  export let fabBottom = 18;

  let open = false;
  let input = "";
  let loading = false;

  type Msg = { role: "user" | "assistant"; content: string; at: string };
  let messages: Msg[] = [];
  let msgsEl: HTMLDivElement | null = null;

  const renderer = new marked.Renderer();

  renderer.link = ({ href, title, tokens }) => {
    const safeHref = href ?? "#";
    const safeTitle = title ? ` title="${title}"` : "";
    const inner = marked.parser(tokens);
    return `<a href="${safeHref}"${safeTitle} target="_blank" rel="noopener noreferrer">${inner}</a>`;
  };

  marked.setOptions({
    breaks: true,
    gfm: true,
    renderer,
  });

  function renderMessage(content: string): string {
    return marked.parse(content ?? "") as string;
  }

  // --- локальное хранение чата ---

  function storageKey() {
    const id = payload?.id ?? payload?.address ?? payload?.slug ?? "global";
    return `assistant:${contextKey}:${id}`;
  }

  function loadLocalHistory() {
    if (!browser) return;
    try {
      const raw = localStorage.getItem(storageKey());
      messages = raw ? JSON.parse(raw) : [];
    } catch {
      messages = [];
    }
  }

  function saveLocalHistory() {
    if (!browser) return;
    localStorage.setItem(storageKey(), JSON.stringify(messages.slice(-30)));
  }

  function clearChat() {
    messages = [];
    input = "";
    loading = false;
    if (browser) {
      try {
        localStorage.removeItem(storageKey());
      } catch {
        // ignore
      }
    }
    tick().then(scrollToBottom);
  }

  function scrollToBottom() {
    if (!msgsEl) return;
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  async function toggle() {
    open = !open;
    if (open) {
      loadLocalHistory();
      await tick();
      scrollToBottom();
    }
  }

  // если поменяли контекст/пейлоад пока попап открыт — перезагрузим историю
  $: if (browser && open) {
    loadLocalHistory();
    tick().then(scrollToBottom);
  }

  async function send() {
    if (!browser) return; // страховка
    if (!input.trim() || loading) return;

    const prompt = input.trim();
    input = "";

    messages = [
      ...messages,
      { role: "user", content: prompt, at: new Date().toISOString() },
    ];
    saveLocalHistory();
    await tick();
    scrollToBottom();

    loading = true;

    const historyForServer = messages
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt,
          contextKey,
          payload,
          history: historyForServer,
        }),
      });

      const data = await res.json();
      const reply = data?.reply ?? "Что-то пошло не так. Попробуйте позже.";

      messages = [
        ...messages,
        { role: "assistant", content: reply, at: new Date().toISOString() },
      ];
      saveLocalHistory();
      await tick();
      scrollToBottom();
    } catch (e) {
      messages = [
        ...messages,
        {
          role: "assistant",
          content: "Ошибка сети. Попробуйте ещё раз.",
          at: new Date().toISOString(),
        },
      ];
      saveLocalHistory();
    } finally {
      loading = false;
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function onGlobalKey(e: KeyboardEvent) {
    if (e.key === "Escape" && open) open = false;
  }

  onMount(() => {
    if (!browser) return;
    window.addEventListener("keydown", onGlobalKey);
  });

  onDestroy(() => {
    if (!browser) return;
    window.removeEventListener("keydown", onGlobalKey);
  });
</script>

<div class="assistant-root" aria-live="polite">
  <button
    class="fab"
    style={`right:${fabRight}px; bottom:${fabBottom}px;`}
    on:click={toggle}
    aria-label="AI assistant"
    title="AI помощник"
  >
    ✨
  </button>

  {#if open}
    <div class="popup">
      <div class="header">
        <div class="title">
          {title}
          <span class="ctx">
            <!-- ({contextKey}) -->
          </span>
        </div>

        <div class="header-actions">
          <button class="clear" on:click={clearChat} title="Очистить чат">
            Очистить
          </button>
          <button class="close" on:click={toggle} title="Закрыть">✕</button>
        </div>
      </div>

      <div class="msgs" bind:this={msgsEl}>
        {#if messages.length === 0}
          <div class="empty">Спроси что-нибудь по этой странице 🙂</div>
        {/if}

        {#each messages as m}
          <div class="msg {m.role}">
            <div class="bubble">
              {#if m.role === "assistant"}
                {@html renderMessage(m.content)}
              {:else}
                {m.content}
              {/if}
            </div>
            <div class="time">
              {new Date(m.at).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        {/each}

        {#if loading}
          <div class="msg assistant">
            <div class="bubble typing">Думаю…</div>
          </div>
        {/if}
      </div>

      <div class="input">
        <textarea
          bind:value={input}
          rows="1"
          placeholder="Введите вопрос…"
          on:keydown={onKeyDown}
        />
        <button
          class="send"
          disabled={loading || !input.trim()}
          on:click={send}
        >
          ➤
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .assistant-root {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
  }

  .fab {
    position: fixed;
    width: 56px;
    height: 56px;
    border-radius: 999px;
    border: none;
    background: linear-gradient(180deg, #4aa3ff, #2b67c7);
    color: white;
    font-size: 22px;
    cursor: pointer;
    display: grid;
    place-items: center;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
    pointer-events: auto;
  }

  .popup {
    position: fixed;
    right: 18px;
    bottom: 86px;

    width: 360px;
    max-width: calc(100vw - 36px);
    height: min(520px, 70vh);

    background: #fff;
    border-radius: 14px;
    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.3);
    display: grid;
    grid-template-rows: auto 1fr auto;
    overflow: hidden;
    pointer-events: auto;
  }

  .header {
    padding: 10px 12px;
    background: #0b0f17;
    color: #e6e8ee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .title {
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ctx {
    opacity: 0.7;
    font-weight: 500;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 0 0 auto;
  }

  .clear {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: #e6e8ee;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 999px;
    cursor: pointer;
  }

  .close {
    background: transparent;
    border: none;
    color: #e6e8ee;
    font-size: 18px;
    cursor: pointer;
    line-height: 1;
  }

  .msgs {
    padding: 12px;
    overflow: auto;
    display: grid;
    gap: 10px;
    background: #f7f8fb;
  }

  .empty {
    font-size: 14px;
    opacity: 0.6;
    text-align: center;
    margin-top: 12px;
  }

  .msg {
    display: grid;
    gap: 4px;
  }
  .msg.user {
    justify-items: end;
  }
  .msg.assistant {
    justify-items: start;
  }

  .bubble {
    max-width: 85%;
    padding: 8px 10px;
    border-radius: 10px;
    font-size: 14px;
    white-space: pre-wrap;
    line-height: 1.35;
  }

  .msg.user .bubble {
    background: #e8f0ff;
    border: 1px solid #d7e4ff;
  }

  .msg.assistant .bubble {
    background: #fff;
    border: 1px solid #e6e8ee;
  }

  .typing {
    opacity: 0.7;
  }
  .time {
    font-size: 11px;
    opacity: 0.6;
  }

  .input {
    padding: 8px;
    display: flex;
    gap: 6px;
    border-top: 1px solid #e6e8ee;
    background: #fff;
  }

  textarea {
    flex: 1;
    resize: none;
    padding: 8px 10px;
    border: 1px solid #d7d9df;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    min-height: 36px;
    max-height: 120px;
  }

  .send {
    width: 40px;
    border: none;
    border-radius: 8px;
    background: #2b67c7;
    color: white;
    font-size: 16px;
    cursor: pointer;
    display: grid;
    place-items: center;
  }

  .send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 520px) {
    .popup {
      right: 10px;
      bottom: 78px;
      width: calc(100vw - 20px);
    }

    .fab {
      right: 12px !important;
      bottom: 12px !important;
    }
  }
</style>
