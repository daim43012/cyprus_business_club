<script lang="ts">
  import { onMount } from "svelte";

  let tickets : any[];
  let loading = true;

  onMount(async () => {
    const res = await fetch("/api/user/profile/tickets");
    if (res.ok) tickets = await res.json();
    loading = false;
  });
</script>

{#if loading}
  <p>Загрузка билетов...</p>
{:else if tickets.length === 0}
  <p>У вас нет билетов на предстоящие события.</p>
{:else}
  <div class="tickets-list">
    {#each tickets as t}
      <div class="ticket">

        <div class="ticket-content">
          <h3 class="event-title">{t.event.title}</h3>

          <div class="event-meta">
            <div>📅 {new Date(t.event.date).toLocaleDateString("ru-RU")}</div>
            {#if t.event.location}
              <div>📍 {t.event.location}</div>
            {/if}
          </div>

          <div class="ticket-id">Билет № {t.id.slice(0,8)}</div>
        </div>

        <div class="ticket-stub">
          <div class="qr">🎟️</div>
        </div>

      </div>
    {/each}
  </div>
{/if}

<style>
  .tickets-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .ticket {
    display: flex;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 6px 14px rgba(0,0,0,0.08);
    border: 1px solid #e5e7eb;
    overflow: hidden;
  }

  /* левая часть билета */
  .ticket-content {
    flex: 1;
    padding: 20px 26px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .event-title {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 10px;
    color: #0b3954;
  }

  .event-meta {
    display: flex;
    gap: 18px;
    font-size: 0.95rem;
    color: #475569;
    margin-bottom: 12px;
  }

  .ticket-id {
    font-size: 0.85rem;
    color: #64748b;
  }

  /* правая часть */
  .ticket-stub {
    width: 130px;
    background: #f8fafc;
    border-left: 1px dashed #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .qr {
    width: 70px;
    height: 70px;
    background: #e0f2fe;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34px;
  }
</style>
