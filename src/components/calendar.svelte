<script lang="ts">
  import { onMount } from "svelte";

  // ===== Типы =====

  interface Event {
    id: string;
    title: string;
    date: string;
    description?: string;
    location?: string;
    isRegistered?: boolean;
    photo?: string;
  }

  interface UserMini {
    id: string;
    email: string;
    name: string | null;
    photo: string;
  }

  interface Meeting {
    id: string;
    start: string;
    end: string;
    host: UserMini;
    client: UserMini;
  }

  interface CalendarEvent extends Event {
    type: "event";
  }

  interface CalendarMeeting extends Meeting {
    type: "meeting";
  }

  type CalendarItem = CalendarEvent | CalendarMeeting;

  // ===== Данные =====

  let events: Event[] = [];
  let meetings: Meeting[] = [];
  let currentUserId: string | null = null;

  let loading = true;
  let error: string | null = null;

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  // Hover tooltip
  let hoverItem: CalendarItem | null = null;
  let hoverX = 0;
  let hoverY = 0;

  // ===== Загрузка =====

  onMount(async () => {
    try {
      const res = await fetch("/api/user/calendar");
      if (!res.ok) throw new Error("Ошибка загрузки");

      const data = await res.json();

      currentUserId = data.currentUserId;
      events = data.events;
      meetings = data.meetings;
    } catch (err) {
      console.error(err);
      error = "Ошибка при загрузке данных";
    } finally {
      loading = false;
    }
  });

  // ===== Helpers =====

  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function changeMonth(delta: number) {
    currentMonth += delta;

    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    } else if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  function eventsForDay(day: number): CalendarItem[] {
    const dateStr = new Date(currentYear, currentMonth, day)
      .toISOString()
      .split("T")[0];

    const dailyEvents: CalendarEvent[] = events
      .filter((e) => e.date.startsWith(dateStr))
      .map((e) => ({ ...e, type: "event" }));

    const dailyMeetings: CalendarMeeting[] = meetings
      .filter((m) => m.start.startsWith(dateStr))
      .map((m) => ({ ...m, type: "meeting" }));

    return [...dailyEvents, ...dailyMeetings];
  }

  function isToday(day: number) {
    const t = new Date();
    return (
      t.getFullYear() === currentYear &&
      t.getMonth() === currentMonth &&
      t.getDate() === day
    );
  }

  function getTime(date: string) {
    return new Date(date).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getMeetingPartner(m: Meeting): UserMini {
    if (!currentUserId) return m.host;
    return m.host.id === currentUserId ? m.client : m.host;
  }

  // Hover
  function showPreview(item: CalendarItem, e: MouseEvent) {
    hoverItem = item;
    hoverX = e.clientX + 15;
    hoverY = e.clientY + 15;
  }

  function hidePreview() {
    hoverItem = null;
  }
</script>

<!-- ===== Календарь ===== -->

<div class="calendar-container">
  <div class="calendar-top">
    <h1 class="title">📅 Календарь</h1>

    <div class="month-switch">
      <button class="arrow" on:click={() => changeMonth(-1)}>‹</button>
      <span>{monthNames[currentMonth]} {currentYear}</span>
      <button class="arrow" on:click={() => changeMonth(1)}>›</button>
    </div>
  </div>

  {#if loading}
    <p class="loader">Загрузка...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else}
    <div class="weekdays">
      {#each weekDays as day}
        <div class="weekday">{day}</div>
      {/each}
    </div>

    <div class="calendar-grid">
      {#each Array(getDaysInMonth(currentYear, currentMonth)) as _, i}
        <div class="calendar-day {isToday(i + 1) ? 'today' : ''}">
          <div class="day-number">{i + 1}</div>

          <div class="events-list">
            {#each eventsForDay(i + 1) as item}
              <div
                class="event-line"
                on:mouseenter={(e) => showPreview(item, e)}
                on:mouseleave={hidePreview}
                on:click={() =>
                  item.type === "event"
                    ? (window.location.href = `/events/${item.id}`)
                    : null}
              >
                <span
                  class="dot
                    {item.type === 'event' && item.isRegistered
                    ? 'dot-registered'
                    : ''}
                    {item.type === 'meeting' ? 'dot-meeting' : ''}"
                ></span>

                {#if item.type === "event"}
                  <span class="event-text">
                    {getTime(item.date)} — {item.title}
                  </span>
                {:else}
                  <span class="event-text">
                    {getTime(item.start)} — Встреча
                  </span>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
{#if hoverItem}
  <div class="hover-card" style="top: {hoverY}px; left: {hoverX}px;">
    <!-- Заголовок -->
    <div class="hover-title">
      {#if hoverItem.type === "meeting"}
        Встреча
      {:else}
        {hoverItem.title}
      {/if}
    </div>

    <!-- EVENT: большое фото -->
    {#if hoverItem.type === "event"}
      {#if hoverItem.photo}
        <img
          class="hover-cover"
          src={`/api/photo/${hoverItem.photo.split("/").pop()}`}
          alt={hoverItem.title}
        />
      {:else}
        <img
          class="hover-cover"
          src="/assets/images/placeholder-event.jpg"
          alt="Event"
        />
      {/if}
    {:else}
      <!-- MEETING: маленький аватар + имя -->
      {@const partner = getMeetingPartner(hoverItem)}

      <div class="meeting-user">
        <img
          class="meeting-avatar"
          src={partner.photo}
          alt={partner.name ?? partner.email}
        />
        <div class="meeting-name">
          {partner.name ?? partner.email}
        </div>
      </div>
    {/if}

    <!-- Дата -->
    <div class="hover-date">
      {hoverItem.type === "meeting"
        ? new Date(hoverItem.start).toLocaleString("ru-RU")
        : new Date(hoverItem.date).toLocaleString("ru-RU")}
    </div>

    <!-- Локация -->
    {#if hoverItem.type === "event" && hoverItem.location}
      <div class="hover-loc">
        {hoverItem.location.length > 45
          ? hoverItem.location.slice(0, 45) + "…"
          : hoverItem.location}
      </div>
    {/if}
  </div>
{/if}

<style>
  .calendar-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .calendar-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1.5rem 0 1rem;
  }
  .meeting-user {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .meeting-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    background: #f1f5f9;
  }

  .meeting-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #0b3954;
  }

  .title {
    color: #0b3954;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .month-switch {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: #f8fafc;
    padding: 0.3rem 0.6rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .month-switch span {
    min-width: 130px;
    text-align: center;
  }

  .arrow {
    background: none;
    border: none;
    color: #2563eb;
    font-size: 1.1rem;
    cursor: pointer;
  }

  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.6rem;
  }

  .calendar-day {
    background: white;
    border-radius: 10px;
    padding: 0.5rem;
    height: 120px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
  }

  .today {
    background: #f0f9ff;
    border: 1px solid #3b82f6;
  }

  .day-number {
    font-weight: 600;
    margin-bottom: 0.2rem;
  }

  .events-list {
    overflow-y: auto;
  }

  .event-line {
    font-size: 0.8rem;
    margin: 0.2rem 0;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .event-line:hover {
    text-decoration: underline;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #5eead4;
    margin-right: 6px;
  }

  .dot-registered {
    background: #16a34a;
  }

  .dot-meeting {
    background: #8b5cf6;
  }

  .hover-card {
    position: fixed;
    z-index: 10000;
    background: white;
    padding: 0.9rem 1rem;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
    pointer-events: none;
    width: 230px;
    animation: fadeIn 0.12s ease-out;
  }

  .hover-cover {
    width: 100%;
    height: 90px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
