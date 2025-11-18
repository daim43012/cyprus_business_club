<script lang="ts">
  import { onMount } from "svelte";

  // типы
  type Event = {
    id: string;
    title: string;
    description?: string;
    categories?: { name: string }[]; // т.к. у тебя many-to-many
    date: string;
    location: string;
    price?: number | null;
    photo?: string | null;
  };

  type Category = {
    id: string;
    name: string;
  };

  // состояние
  let categories: Category[] = [];
  let selectedCategory: string = "All";
  let sortOption: "name" | "date" = "name";
  let events: Event[] = [];
  let loading = true;
  let error: string | null = null;

  // загружаем категории и события
  onMount(async () => {
    try {
      // Загружаем категории
      const catRes = await fetch("/api/categories");
      if (!catRes.ok) throw new Error("Failed to load categories");
      const catData = await catRes.json();
      categories = [{ id: "all", name: "All" }, ...catData]; // добавляем "All" в начало

      // Загружаем события
      const eventRes = await fetch("/api/events");
      if (!eventRes.ok) throw new Error("Failed to load events");
      const eventData = await eventRes.json();
      events = eventData;
    } catch (err) {
      console.error(err);
      error = "Ошибка при загрузке данных 😔";
    } finally {
      loading = false;
    }
  });

  // фильтрация + сортировка
  $: filteredEvents = events
    .filter((e) => {
      if (selectedCategory === "All" || selectedCategory === "all") return true;
      // проверяем, есть ли у ивента нужная категория
      return e.categories?.some((c) => c.name === selectedCategory);
    })
    .sort((a, b) => {
      if (sortOption === "name") return a.title.localeCompare(b.title);
      if (sortOption === "date")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      return 0;
    });
</script>

<!-- Заголовок -->
<h1>All Events</h1>

<!-- Фильтрация и сортировка -->
<div class="top-bar">
  <div class="categories">
    {#each categories as category}
      <div
        class="category {selectedCategory === category.name ? 'active' : ''}"
        on:click={() => (selectedCategory = category.name)}
      >
        {category.name}
      </div>
    {/each}
  </div>

  <div class="controls">
    <label>
      Сортировка:
      <select bind:value={sortOption}>
        <option value="name">По названию</option>
        <option value="date">По дате</option>
      </select>
    </label>
  </div>
</div>

{#if loading}
  <p class="loading"></p>
{:else if error}
  <p class="error">{error}</p>
{:else}
  <div class="grid">
    {#each filteredEvents as event (event.id)}
      <a href={`/events/${event.id}`} class="card">
        <div class="img-wrapper">
          <img
            src={event.photo
              ? `/api/photo/${event.photo.split("/").pop()}`
              : "/assets/images/placeholder-event.jpg"}
            alt={event.title}
          />
        </div>

        <div class="card-content">
          <h3>{event.title}</h3>

          {#if event.categories?.length}
            <p class="category-line">
              {event.categories.map((c) => c.name).join(", ")}
            </p>
          {/if}

          <p class="location">
            <span class="icon">📍</span>
            {event.location}
          </p>
          <p class="date">
            <span class="icon">📅</span>

            {new Date(event.date).toLocaleDateString("ru-RU", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </a>
    {/each}
  </div>
{/if}

<style>
  .icon {
    margin-right: 4px;
    opacity: 0.7;
  }

  h1 {
    text-align: center;
    margin-top: 3rem;
    font-size: 2rem;
    font-weight: 700;
    color: #0b3954;
  }

  .subtitle {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #64748b;
    font-size: 0.95rem;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    max-width: 1100px;
    margin: 0 auto 1.5rem auto;
    padding: 0 1rem;
    gap: 1rem;
  }

  .categories {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .category {
    background: white;
    color: #0b3954;
    border-radius: 9999px;
    padding: 0.4rem 1rem;
    border: 1px solid #cbd5e1;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.25s ease;
  }

  .category:hover {
    background: #e2e8f0;
  }

  .category.active {
    background: #0b3954;
    color: white;
    border-color: #0b3954;
  }
  .card:hover .img-wrapper img {
    transform: scale(1.05);
  }

  .img-wrapper img {
    transition: transform 0.4s ease;
  }

  .controls select {
    padding: 0.4rem 0.6rem;
    border-radius: 0.4rem;
    border: 1px solid #cbd5e1;
    background: white;
    font-size: 0.85rem;
  }

  /* GRID */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
    gap: 1rem;
    max-width: 1100px;
    margin: 0 auto 3rem auto;
    padding: 0 0.5rem;
  }

  /* CARD — теперь это ссылка */
  .card {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 0.75rem;
    overflow: hidden;
    height: 330px;
    width: 100%;
    text-decoration: none;
    color: inherit;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;
    cursor: pointer;
  }

  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.07);
  }

  /* IMAGE FIX — не сжимается */
  .img-wrapper {
    width: 100%;
    height: 160px;
    overflow: hidden;
  }

  .img-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* ключ */
  }

  /* CONTENT */
  .card-content {
    padding: 0.8rem 1rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .card h3 {
    margin-bottom: 0.2rem;
    color: #0b3954;
    font-size: 1rem;
    font-weight: 600;
  }

  /* CATEGORY LINE */
  .category-line {
    font-size: 0.85rem;
    color: #475569;
  }

  /* LOCATION SHORTEN */
  .location {
    font-size: 0.85rem;
    color: #475569;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* DATE */
  .date {
    margin-top: auto;
    font-size: 0.85rem;
    color: #0b3954;
    font-weight: 500;
  }

  .no-events {
    text-align: center;
    color: #64748b;
    font-size: 0.95rem;
    margin-top: 2rem;
  }
</style>
