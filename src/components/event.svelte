<script lang="ts">
  import { onMount } from "svelte";
  import "leaflet/dist/leaflet.css";
  import ExchangeFormCurrencies from "./Exchange/ExchangeFormCurrencies.svelte";

  export let data: any;

  const event = data.event;
  let attendees = data.attendees || [];
  let attendeesCount = data.attendeesCount || 0;
  let isRegistered = data.isRegistered || false;

  // 📌 Координаты из базы
  let coords = [event.latitude ?? 52.52, event.longitude ?? 13.405];

  let mapContainer: HTMLElement;
  let L: any;

  onMount(async () => {
    // Загружаем Leaflet только на клиенте
    const leaflet = await import("leaflet");
    await import("leaflet/dist/leaflet.css");
    L = leaflet.default;

    // 🔥 ФИКС для битых маркеров в Chrome/Safari
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      iconUrl: "/leaflet/marker-icon.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    });

    const map = L.map(mapContainer).setView(coords, 13);

    // Карта
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Маркер
    L.marker(coords).addTo(map);
  });

  // 🟩 Регистрация на событие
  async function register() {
    const res = await fetch(`/api/events/${event.id}/register`, {
      method: "POST",
    });

    if (!res.ok) return;

    isRegistered = true;
    attendeesCount += 1;

    // Визуально добавим текущего пользователя
    attendees = [
      ...attendees,
      {
        id: data.user?.id ?? "you",
        info: { name: data.user?.email ?? "Вы", photo: null },
        email: data.user?.email ?? "Вы",
      },
    ];
  }

  // 🧩 Аватар пользователя
  function getAvatar(user: any) {
    if (user?.info?.photo) return user.info.photo;

    const seed = encodeURIComponent(user?.info?.name || user?.email || "User");

    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;
  }
</script>

<section class="wrapper">
  <!-- HEADER -->
  <div class="header-block">
    {#if event.photo}
       <img class="cover"
            src={event.photo
              ? `/api/photo/${event.photo.split("/").pop()}`
              : "/assets/images/placeholder-event.jpg"}
            alt={event.title}
          />
    {/if}

    <div class="header-info">
      <h1>{event.title}</h1>
      <p class="subtitle">{event.description}</p>

      <div class="meta">
        <p>
          <strong>📅 Дата:</strong>
          {new Date(event.date).toLocaleDateString("ru-RU")}
        </p>

        {#if event.organizer}
          <p>
            <strong>👤 Организатор:</strong>
            <a class="organizer-link" href={`/members/${event.organizer.id}`}>
              {event.organizer.info?.name || event.organizer.email}
            </a>
          </p>
        {/if}
      </div>

      <!-- 🔥 Кнопка регистрации -->
      {#if isRegistered}
        <button class="btn registered" disabled>Вы уже идёте ✔</button>
      {:else}
        <button class="btn primary" on:click={register}>
          Зарегистрироваться
        </button>
      {/if}
    </div>
  </div>

  <div class="attendees-block">
    <h2>Кто идёт ({attendees.length})</h2>

    <div class="avatars">
      {#each attendees as user}
        <a href={`/members/${user.id}`} class="avatar-link">
          <img src={getAvatar(user)} alt="User avatar" class="avatar-img" />
        </a>
      {/each}
    </div>
  </div>
<!-- <ExchangeFormCurrencies
    type="DEPOSIT"
    amount="6"
    currencyCodeChain="POL-Polygon"
    address="0xad98403fe174a46e3e4d0793af579c23b666efed"
  /> -->

  <!-- LOCATION -->
  <div class="location-block">
    <h2>📍 Локация</h2>
    <p class="address">{event.location}</p>

    <div bind:this={mapContainer} id="map"></div>
  </div>
</section>

<style>
  #map {
    width: 100%;
    height: 320px;
    border-radius: 12px;
    overflow: hidden;
    margin-top: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .wrapper {
    max-width: 900px;
    margin: 2rem auto;
    padding: 2rem;
    background: #ffffff;
    border-radius: 1rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
  .avatars {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .avatar-img {
    border-radius: 50%;
    width: 38px;
    height: 38px;
    object-fit: cover;
    background: #f1f5f9;
    border: 2px solid #e2e8f0;
  }
  .cover {
    width: 100%;
    max-height: 340px;
    object-fit: cover;
    border-radius: 1rem;
  }
  .avatar-link {
    display: inline-block;
  }
  .avatar-link:hover .avatar-img {
    transform: scale(1.06);
  }
  .organizer-link {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
  }
  .organizer-link:hover {
    text-decoration: underline;
  }

  .header-info {
    margin-top: 1.2rem;
  }

  .subtitle {
    color: #475569;
    margin-bottom: 1rem;
  }

  .meta p {
    margin: 0.4rem 0;
    color: #334155;
  }

  .btn {
    margin-top: 1rem;
    padding: 0.8rem 1.4rem;
    border-radius: 0.6rem;
    border: none;
    cursor: pointer;
    font-weight: 600;
  }

  .btn.primary {
    background: #2563eb;
    color: white;
  }

  .btn.primary:hover {
    background: #3b82f6;
  }

  .btn.registered {
    background: #22c55e;
    color: white;
  }

  .attendees-block {
    margin-top: 2rem;
  }

  .avatars {
    display: flex;
    gap: -10px;
    margin-top: 1rem;
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid white;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.15);
    margin-left: -14px;
  }

  .avatar:first-child {
    margin-left: 0;
  }

  .location-block {
    margin-top: 2.5rem;
  }

  #map {
    width: 100%;
    height: 300px;
    border-radius: 0.8rem;
    overflow: hidden;
  }
</style>
