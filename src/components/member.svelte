<script lang="ts">
  import { timeAgo } from "$lib/utils/timeAgo";
  import { onMount } from "svelte";
  import BookingModal from "./bookingModal.svelte";
  import ContextAssistant from "./ContextAssistant.svelte";
  import { photoSrc } from "$lib/utils/photo";

  export let data: any;
  const member = data.member;
  const currentUserId = data.currentUserId;
  let availability = data.availability || [];
  let showBooking = false;

  let activeTab = "upcoming";

  const registeredEvents = data.registeredEvents || [];
  const visitedEvents = data.visitedEvents || [];
  const upcomingEvents = data.upcomingEvents || [];
  const createdEvents = data.createdEvents || [];

  let isFollowing = false;
  let loadingFollow = false;
  let followersCount = 0;
  let followingCount = 0;

  // ✅ аватар: либо google http(s), либо /api/photo/<file>, либо dicebear
  const fallback = () =>
    "https://api.dicebear.com/7.x/initials/svg?seed=" +
    encodeURIComponent(member?.info?.name || "User");

  $: avatar = photoSrc(member?.info?.photo) ?? fallback();

  function selectSlot(meeting: any) {
    console.log("Meeting created:", meeting);
    showBooking = false;
  }

  onMount(async () => {
    try {
      const res = await fetch(`/api/member/follow?userId=${member.id}`);
      if (res.ok) {
        const data = await res.json();
        isFollowing = data.following;
      }

      const res2 = await fetch(`/api/member/followers?userId=${member.id}`);
      if (res2.ok) {
        const data2 = await res2.json();
        followersCount = data2.counts.followers;
        followingCount = data2.counts.following;
      }
    } catch (err) {
      console.error("Profile load error:", err);
    }
  });

  async function toggleFollow() {
    loadingFollow = true;
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch("/api/member/follow", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: member.id }),
      });

      if (res.ok) {
        isFollowing = !isFollowing;

        const res2 = await fetch(`/api/member/followers?userId=${member.id}`);
        if (res2.ok) {
          const data2 = await res2.json();
          followersCount = data2.counts.followers;
          followingCount = data2.counts.following;
        }
      } else {
        const errText = await res.text();
        console.error("Follow toggle failed:", errText);
        alert(errText);
      }
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      loadingFollow = false;
    }
  }

  async function startChat() {
    try {
      const res = await fetch("/api/chat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: member.id }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Chat creation failed:", txt);
        alert("Cannot start chat: " + txt);
        return;
      }

      const data = await res.json();
      window.location.href = `/chat/${data.chatId}`;
    } catch (err) {
      console.error("Start chat error:", err);
      alert("Error creating chat");
    }
  }

  function handleBookMeeting() {
    alert(`Booking meeting with ${member.info?.name}`);
  }
</script>

<ContextAssistant
  contextKey="expert"
  payload={member}
  title="Спросить про эксперта"
/>
{#if !member}
  <p class="error">Member not found.</p>
{:else}
  <div class="profile-layout">
    <!-- Левая колонка -->
    <div class="profile-card">
      <div class="profile-header">
        <img src={avatar} alt="Member photo" class="profile-photo" />

        <div class="user-info">
          <h2>{member.info?.name || "Unnamed member"}</h2>
          <span class="badge">{member.info?.status || "Member"}</span>

          <!-- 🔥 блок с количеством подписчиков -->
          <div class="followers-block">
            <div class="followers-item">
              <span class="followers-count">{followersCount}</span>
              <span class="followers-label">Followers</span>
            </div>
            <div class="followers-item">
              <span class="followers-count">{followingCount}</span>
              <span class="followers-label">Following</span>
            </div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="profile-info">
        <div class="joined">
          <span class="icon">📅</span>
          Зарегистрирован:{" "}
          {new Date(member.createdAt).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>

        {#if member.lastOnline}
          <div class="last-online">
            <span class="icon">🕒</span>
            Был(а) онлайн {timeAgo(member.lastOnline)}
          </div>
        {:else}
          <div class="last-online">
            <span class="icon">🕒</span>
            Ещё не был(а) онлайн
          </div>
        {/if}
      </div>

      {#if currentUserId !== member.id}
        <button
          class="follow-btn"
          on:click={toggleFollow}
          disabled={loadingFollow}
        >
          {#if loadingFollow}
            ⏳
          {:else if isFollowing}
            ✅ Following
          {:else}
            ➕ Follow
          {/if}
        </button>

        <button class="follow-btn" on:click={startChat}>
          💬 Send Message
        </button>
      {/if}

      {#if member.info?.status?.toLowerCase() === "partner"}
        <button class="book-btn" on:click={() => (showBooking = true)}>
          📆 Book meeting
        </button>
      {/if}
    </div>

    <!-- Правая колонка -->
    <div class="profile-details">
      {#if member.info?.bio}
        <div class="info-block tall">
          <h3>About</h3>
          <p>{member.info.bio}</p>
        </div>
      {/if}

      <div class="info-block tall">
        <h3>Events</h3>

        <div class="tabs-small">
          <div
            class="tab"
            class:active={activeTab === "upcoming"}
            on:click={() => (activeTab = "upcoming")}
          >
            Upcoming
          </div>

          <div
            class="tab"
            class:active={activeTab === "visited"}
            on:click={() => (activeTab = "visited")}
          >
            Visited
          </div>
        </div>

        <!-- Контент табов -->
        {#if activeTab === "upcoming"}
          {#if upcomingEvents.length > 0}
            <ul class="events-list">
              {#each upcomingEvents as ev}
                <li class="event-card-line">
                  <div class="e-left">
                    <a href={`/events/${ev.id}`} class="e-title">{ev.title}</a>
                    <span class="e-date">
                      {new Date(ev.date).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <a href={`/events/${ev.id}`} class="e-btn">
                    Перейти
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="empty">Нет запланированных событий</p>
          {/if}
        {:else if visitedEvents.length > 0}
          <ul class="events-list">
            {#each visitedEvents as ev}
              <li>
                <a href={`/events/${ev.id}`}>{ev.title}</a>
                <span class="date">
                  {new Date(ev.date).toLocaleDateString("ru-RU")}
                </span>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="empty">Пока не посещал события</p>
        {/if}
      </div>
    </div>
  </div>
{/if}
{#if showBooking}
  <BookingModal
    {availability}
    {member}
    onClose={() => (showBooking = false)}
    onBooked={selectSlot}
  />
{/if}

<style>
  .event-card-line {
    background: #fff;
    padding: 14px 20px;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    margin-bottom: 12px;
    transition: 0.2s;
  }

  .event-card-line:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.07);
  }

  .e-left {
    display: flex;
    flex-direction: column;
  }

  .e-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #0b3954;
    text-decoration: none;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 380px; /* чтобы длинные названия красиво обрезались */
  }

  .e-title:hover {
    color: #0070f3;
  }

  .e-date {
    font-size: 0.9rem;
    color: #64748b;
    margin-top: 2px;
  }

  .e-btn {
    color: #ffffff;
    text-decoration: none;
    padding: 8px 18px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.2px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition:
      background 0.2s,
      transform 0.15s;
    white-space: nowrap;
  }

  .e-btn:active {
    transform: translateY(1px);
  }

  .e-btn svg {
    width: 16px;
    height: 16px;
  }

  .tabs-small {
    display: flex;
    gap: 24px;
    border-bottom: 1px solid #2d2d2f;
    margin-bottom: 16px;
    padding-bottom: 4px;
  }

  .tab {
    font-size: 15px;
    color: #888;
    cursor: pointer;
    padding: 6px 0;
    transition: 0.2s;
    position: relative;
  }

  .tab:hover {
    color: #000000;
  }

  .tab.active {
    color: #888;
    font-weight: 500;
  }

  .tab.active::after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 0;
    right: 0;
    height: 2px;
    background: #0a84ff;
    border-radius: 4px;
  }

  .events-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .events-list li {
    padding: 10px 0;
    border-bottom: 1px solid #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .events-list li a {
    color: #0a84ff;
    text-decoration: none;
  }

  .events-list li a:hover {
    text-decoration: underline;
  }

  .date {
    color: #888;
    font-size: 14px;
  }

  .empty {
    color: #777;
    font-size: 14px;
    margin-top: 8px;
  }

  .followers-block {
    display: flex;
    gap: 1.5rem;
    margin-top: 0.6rem;
  }

  .followers-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .followers-count {
    font-weight: 700;
    font-size: 1.2rem;
    color: #0b3954;
    line-height: 1;
  }

  .followers-label {
    font-size: 0.85rem;
    color: #64748b;
  }
  .profile-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 2rem;
    max-width: 1100px;
    margin: 2.5rem auto;
    align-items: start;
    padding: 0 1rem;
  }

  .profile-card {
    background: #fff;
    padding: 1.5rem;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .profile-photo {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    object-fit: cover;
  }

  .user-info h2 {
    font-size: 1.3rem;
    color: #0b3954;
    margin: 0;
  }

  .badge {
    background: #0070f3;
    color: white;
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
    font-size: 0.8rem;
    margin-top: 0.2rem;
    display: inline-block;
  }

  .divider {
    height: 1px;
    background: #e2e8f0;
    margin: 1.2rem 0;
  }

  .profile-info {
    color: #475569;
    font-size: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .follow-btn {
    background: #0ea5e9;
    color: white;
    font-size: 0.95rem;
    font-weight: 500;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1rem;
    margin-top: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  }

  .follow-btn:hover {
    background: #0284c7;
  }

  .follow-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .book-btn {
    background: #0070f3;
    color: white;
    font-size: 0.95rem;
    font-weight: 500;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1rem;
    margin-top: 0.6rem;
    cursor: pointer;
    transition: background 0.2s;
    width: 100%;
  }

  .book-btn:hover {
    background: #0059c9;
  }

  /* Правая колонка */
  .profile-details {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .info-block {
    background: #fff;
    border-radius: 1rem;
    padding: 1.2rem 1.5rem;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
    min-height: 140px;
    transition: transform 0.2s;
  }

  .info-block.tall {
    min-height: 200px;
  }

  .info-block:hover {
    transform: translateY(-2px);
  }

  .info-block h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #0b3954;
    margin-bottom: 0.6rem;
  }

  .info-block p,
  .info-block ul {
    font-size: 0.95rem;
    color: #475569;
    margin: 0;
  }

  .info-block ul {
    list-style: none;
    padding-left: 0;
  }

  .info-block li {
    margin: 0.3rem 0;
  }

  .info-block a {
    color: #2563eb;
    text-decoration: none;
  }

  .info-block a:hover {
    text-decoration: underline;
  }

  .empty {
    color: #94a3b8;
  }

  @media (max-width: 900px) {
    .profile-layout {
      grid-template-columns: 1fr;
    }

    .profile-card {
      max-width: 500px;
      margin: 0 auto;
    }

    .profile-details {
      margin-top: 1.5rem;
    }

    .info-block {
      min-height: 160px;
    }
  }
</style>
