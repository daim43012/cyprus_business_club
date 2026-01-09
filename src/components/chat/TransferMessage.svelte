<script lang="ts">
  export let msg;

  const isMine = msg.isMine;

  const title = isMine
    ? "Вы отправили перевод"
    : "Вы получили перевод";

  // msg.content = "Вы отправили перевод 0.01 USDT"
  const amount = msg.content.replace(/Вы (отправили|получили) перевод/i, "").trim();
</script>

<div class="transfer-msg {isMine ? 'mine' : 'incoming'}">
  <div class="icon">
    💸
  </div>

  <div class="text">
    <div class="title">{title}</div>
    <div class="amount">{amount}</div>
  </div>

  <div class="time">
    {new Date(msg.createdAt).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit"
    })}
  </div>
</div>

<style>
  .transfer-msg {
    display: flex;
    align-items: flex-start;
    gap: 12px;

    padding: 14px 16px;
    border-radius: 16px;

    max-width: 300px;

    background: var(--bg, #fff);
    border: 1px solid var(--border, #e5e7eb);
    color: var(--text, #111);

    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.06),
      0 1px 3px rgba(0, 0, 0, 0.03);

    position: relative;
  }

  /* Входящий */
  .incoming {
    --bg: #ffffffd9;
    --border: #dbeafe;
    --text: #0f172a;
  }

  /* Исходящий */
  .mine {
    margin-left: auto;
    --bg: #eef2ff;
    --border: #c7d2fe;
    --text: #1e1b4b;
  }

  .icon {
    font-size: 1.8rem;
    margin-top: 2px;
    filter: drop-shadow(0 2px 2px rgba(0,0,0,0.08));
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .title {
    font-size: 0.95rem;
    font-weight: 600;
    opacity: 0.85;
  }

  .amount {
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .time {
    position: absolute;
    right: 12px;
    bottom: 8px;
    font-size: 0.7rem;
    opacity: 0.55;
  }
</style>
