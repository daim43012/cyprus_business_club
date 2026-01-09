<script lang="ts">
  export let data: any;
  const event = data.event;

  type AgendaItem = {
    start: string;
    end?: string;
    title: string;
    description?: string;
  };

  function timeToMin(t: string) {
    const [h, m] = String(t).split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  }

  function normalizeAgenda(raw: any): AgendaItem[] {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((x: any) => ({
        start: String(x?.start ?? "").trim(),
        end: x?.end ? String(x.end).trim() : undefined,
        title: String(x?.title ?? "").trim(),
        description: x?.description ? String(x.description).trim() : undefined,
      }))
      .filter((it) => it.start && it.title)
      .sort((a, b) => timeToMin(a.start) - timeToMin(b.start));
  }

  $: agendaItems = normalizeAgenda(event?.agenda);
</script>

{#if agendaItems.length}
  <section class="agenda">
    <header class="agenda-head">
      <div class="left">
        <span class="icon">🗓️</span>
        <h2>Расписание</h2>
      </div>
      <span class="count">{agendaItems.length}</span>
    </header>

    <div class="agenda-list">
      {#each agendaItems as it}
        <article class="agenda-item">
          <div class="time-col">
            <span class="time-pill">{it.start}</span>
            {#if it.end}
              <span class="time-sep">—</span>
              <span class="time-pill ghost">{it.end}</span>
            {/if}
          </div>

          <div class="content">
            <div class="title">{it.title}</div>
            {#if it.description}
              <div class="desc">{it.description}</div>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  </section>
{/if}

<style>
  /* ===== card ===== */
  .agenda {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 16px;
  }

  /* ===== header ===== */
  .agenda-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: #f1f5f9;
    border: 1px solid #e5e7eb;
    font-size: 16px;
  }

  h2 {
    margin: 0;
    font-size: 18px;
    color: #111827;
    letter-spacing: -0.2px;
  }

  .count {
    font-size: 12px;
    color: #6b7280;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    padding: 4px 10px;
    background: #f9fafb;
  }

  /* ===== list ===== */
  .agenda-list {
    display: grid;
    gap: 12px;
  }

  /* ===== item ===== */
  .agenda-item {
    position: relative;
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 14px;
    padding: 14px;
    border-radius: 14px;
    background: linear-gradient(
      180deg,
      #ffffff 0%,
      #fbfdff 100%
    );
    border: 1px solid #eef2f7;
    transition: transform 0.12s ease, box-shadow 0.12s ease,
      border-color 0.12s ease;
  }

  .agenda-item::before {
    content: "";
    position: absolute;
    left: 0;
    top: 12px;
    bottom: 12px;
    width: 3px;
    border-radius: 3px;
    background: #3b82f6;
    opacity: 0.9;
  }

  .agenda-item:hover {
    transform: translateY(-1px);
    border-color: #e5e7eb;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  }

  /* ===== time ===== */
  .time-col {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    padding-left: 8px;
  }

  .time-pill {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
    background: #eff6ff;
    border: 1px solid #dbeafe;
    color: #1d4ed8;
    line-height: 1;
    white-space: nowrap;
  }

  .time-pill.ghost {
    background: #ffffff;
    border-color: #e5e7eb;
    color: #111827;
  }

  .time-sep {
    color: #9ca3af;
    font-size: 12px;
  }

  /* ===== content ===== */
  .content {
    display: grid;
    gap: 6px;
  }

  .title {
    font-weight: 650;
    font-size: 15px;
    color: #111827;
    letter-spacing: -0.1px;
  }

  .desc {
    color: #4b5563;
    font-size: 14px;
    line-height: 1.4;
    white-space: pre-wrap;
  }

  /* ===== mobile ===== */
  @media (max-width: 640px) {
    .agenda-item {
      grid-template-columns: 1fr;
    }

    .agenda-item::before {
      left: 12px;
      top: 0;
      bottom: auto;
      height: 3px;
      width: auto;
      right: 12px;
    }
  }
</style>
