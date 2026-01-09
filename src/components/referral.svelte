<script lang="ts">
  import { onMount } from "svelte";
  export let data;

  const referralId = data.referralId;
  let referrals = data.referrals;

  // возвращаем фото + fallback
  referrals = referrals.map((u: any) => ({
    ...u,
    info: {
      ...u.info,
      photo: u.info?.photo || "/assets/images/user-male-circle.jpg",
    },
  }));

  let referralLink = "";
  let qrSrc = "";

  onMount(() => {
    const origin = window.location.origin;
    referralLink = `${origin}/register?ref=${referralId}`;
    qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
      referralLink
    )}`;
  });

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    alert("Скопировано!");
  }

  // Маскировка email
  function maskEmail(email: string) {
    const [name, domain] = email.split("@");
    if (!name || !domain) return email;
    if (name.length <= 2) return "***@" + domain;
    return name.slice(0, 2) + "***@" + domain;
  }
</script>

<div class="wrapper">
  <div class="card">
    <h1 class="title">Приглашайте друзей и получайте награды</h1>
    <p class="subtitle">
      Поделитесь ссылкой или кодом — ваш друг зарегистрируется, а вы оба
      получите бонусы.
    </p>

    <div class="referral-layout">
      <!-- QR-код -->
      <div class="qr-panel">
        {#if qrSrc}
          <img src={qrSrc} alt="QR code" class="qr" />
        {/if}
        <p class="qr-text">Отсканируйте камерой, чтобы открыть ссылку</p>
      </div>

      <!-- Правый блок -->
      <div class="ref-info">
        <div class="ref-block">
          <h3>Реферальная ссылка</h3>
          <div class="line">
            <input readonly class="input" value={referralLink} />
            <button class="btn" on:click={() => copy(referralLink)}
              >Скопировать</button
            >
            <button
              class="btn"
              on:click={() => navigator.share?.({ url: referralLink })}
              >Поделиться</button
            >
          </div>
        </div>

        <div class="ref-block">
          <h3>Реферальный код</h3>
          <div class="line">
            <input readonly class="input" value={referralId} />
            <button class="btn" on:click={() => copy(referralId)}
              >Скопировать</button
            >
          </div>
        </div>

        <p class="hint">
          Передайте другу ссылку <b>{referralLink}</b> или код
          <b>{referralId}</b>. При регистрации код подставится автоматически.
        </p>
      </div>
    </div>

    <!-- Таблица рефералов -->
    <div class="referrals-table">
      <h3>Мои рефералы</h3>

      {#if referrals.length === 0}
        <p>Ещё никто не зарегистрировался по вашему коду.</p>
      {:else}
        <table>
          <thead>
            <tr>
              <th>Аватар</th>
              <th>Email</th>
              <th>Ник</th>
              <th>Дата регистрации</th>
            </tr>
          </thead>

          <tbody>
            {#each referrals as r}
              <tr>
                <td>
                  <img src={r.info.photo} class="avatar" />
                </td>
                <td>{maskEmail(r.email)}</td>
                <td>{r.info.name || "Без имени"}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
</div>

<style>
  .wrapper {
    width: min(90%, 70rem);
    margin: 3rem auto;
    padding: 0 1rem;
  }

  .card {
    background: #fff;
    border-radius: 1rem;
    padding: 2rem;
    width: 100%;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.05);
    color: #0b3954;
  }

  .title {
    font-size: 2.2rem;
    margin: 0;
  }

  .subtitle {
    margin-top: 0.5rem;
    color: #425c75;
  }

  /* новая сетка */
  .referral-layout {
    margin-top: 2rem;
    display: flex;
    gap: 2rem;
  }

  /* QR уменьшен */
  .qr-panel {
    width: 210px;
    text-align: center;
  }

  .qr {
    width: 180px;
    height: 180px;
    border-radius: 1rem;
  }

  .qr-text {
    margin-top: 1rem;
    color: #425c75;
  }

  .ref-info {
    flex: 1;
  }

  .ref-block {
    margin-bottom: 1.5rem;
  }

  .line {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
  }

  .input {
    flex: 1;
    padding: 0.55rem 1rem;
    border-radius: 0.75rem;
    border: 1px solid #000000;
    background: #f4f7fb;
    font-size: 1rem;
    color: #0b3954;
  }

  .btn {
    padding: 0.55rem 1rem;
    background: #22c55e;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    white-space: nowrap;
    width: 140px;
    text-align: center;
  }

  .btn:hover {
    opacity: 0.9;
  }

  .hint {
    color: #425c75;
    font-size: 0.95rem;
  }

  /* таблица как в макете */
  .referrals-table {
    margin-top: 3rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  th,
  td {
    padding: 0.9rem 1rem;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.95rem;
  }

  th {
    text-align: left;
    color: #425c75;
    font-weight: 600;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover {
    background: #f9fafb;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
  }
</style>
