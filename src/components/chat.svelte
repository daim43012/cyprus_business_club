<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { goto } from "$app/navigation";
  import { onlineStatus } from "$lib/utils/onlineStatus";
  import TransferMessage from "./chat/TransferMessage.svelte";

  export let chatId: string | null = null;

  type ChatTab = "dm" | "event";
  let activeTab: ChatTab = "dm";

  let chats: any[] = [];
  let selectedChat: any = null;
  let isMobile = false;
  let fileInput: HTMLInputElement;

  let messages: any[] = [];
  let lastTimestamp: string | null = null;
  let inputText = "";
  let status = "";

  let messagesContainer: HTMLDivElement;

  let isInitialLoad = false;
  let pollingTimer: any = null;

  let userScrolledUp = false;
  let forceScrollToBottom = false;

  let statusInterval: any = null;
  let selectedFile: File | null = null;

  // ---------- helpers: type guards ----------
  function isEventChat(chat: any) {
    return !!chat?.event;
  }

  // derived lists for tabs
  $: dmChats = chats.filter((c) => !isEventChat(c));
  $: eventChats = chats.filter((c) => isEventChat(c));
  $: visibleChats = activeTab === "dm" ? dmChats : eventChats;

  // ---------- upload ----------
  function handleFile(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    selectedFile = file;
  }

  function autoResize(e: any) {
    const el = e.target as HTMLTextAreaElement;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  // ---------- scroll ----------
  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  function scrollToBottomSmooth() {
    if (!messagesContainer) return;
    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: "smooth",
    });
  }

  function handleScroll() {
    if (!messagesContainer) return;

    const threshold = 40;
    const distanceFromBottom =
      messagesContainer.scrollHeight -
      messagesContainer.scrollTop -
      messagesContainer.clientHeight;

    userScrolledUp = distanceFromBottom > threshold;
  }

  // ---------- navigation ----------
  function openMember(userId: string) {
    goto(`/members/${userId}`);
  }

  // ---------- message content helpers ----------
  function isImage(msg: any) {
    if (typeof msg.content !== "string") return false;
    const ext = msg.content.toLowerCase().split(".").pop();
    return ["png", "jpg", "jpeg", "gif", "webp"].includes(ext ?? "");
  }

  function isFile(msg: any) {
    if (typeof msg.content !== "string") return false;
    if (!msg.content.startsWith("/uploads/")) return false;
    if (isImage(msg)) return false;
    return true;
  }

  // ---------- avatars + titles ----------
  function getUserAvatar(user: any) {
    const photo = user?.info?.photo;
    const name = user?.info?.name || user?.email || "User";

    if (photo) {
      return `/api/photo/${String(photo).split("/").pop()}`;
    }

    return (
      "https://api.dicebear.com/7.x/initials/svg?seed=" +
      encodeURIComponent(name)
    );
  }

  function getEventAvatar(event: any) {
    const photo = event?.photo;
    const title = event?.title || "Event";

    if (photo) {
      return `/api/photo/${String(photo).split("/").pop()}`;
    }

    return (
      "https://api.dicebear.com/7.x/initials/svg?seed=" +
      encodeURIComponent(title)
    );
  }

  function getMessageAvatar(msg: any) {
    return getUserAvatar(msg?.sender);
  }

  function getChatTitle(chat: any) {
    // ✅ event chat
    if (chat?.event?.title) return chat.event.title;

    // ✅ dm chat
    if (chat?.otherUser?.info?.name) return chat.otherUser.info.name;
    if (chat?.otherUser?.email) return chat.otherUser.email;

    return "Chat";
  }

  function getChatPreview(chat: any) {
    return chat?.lastMessage || "Нет сообщений";
  }

  function getChatAvatar(chat: any) {
    if (chat?.event) return getEventAvatar(chat.event);
    if (chat?.otherUser) return getUserAvatar(chat.otherUser);
    return "https://api.dicebear.com/7.x/initials/svg?seed=Chat";
  }

  // ---------- data loading ----------
  async function loadChats() {
    const res = await fetch("/api/chat");
    if (!res.ok) return;

    const data = await res.json();
    chats = data.chats || [];
  }

  async function openChat(chat: any) {
    goto(`/chat/${chat.id}`, { replaceState: false });

    selectedChat = chat;

    if (pollingTimer) clearTimeout(pollingTimer);

    // ✅ статус показываем только для личек
    if (!isEventChat(selectedChat) && selectedChat?.otherUser?.lastOnline) {
      status = onlineStatus(selectedChat.otherUser.lastOnline);
    } else {
      status = "";
    }

    if (statusInterval) clearInterval(statusInterval);

    statusInterval = setInterval(async () => {
      if (!selectedChat) return;

      await loadChats();

      const updated = chats.find((c) => c.id === selectedChat.id);
      if (updated) {
        selectedChat = updated;

        if (!isEventChat(selectedChat) && selectedChat.otherUser?.lastOnline) {
          status = onlineStatus(selectedChat.otherUser.lastOnline);
        } else {
          status = "";
        }
      }
    }, 3000);

    messages = [];
    lastTimestamp = null;
    isInitialLoad = true;
    userScrolledUp = false;
    forceScrollToBottom = false;

    await tick();
    loadMessages();

    setTimeout(loadChats, 200);
  }

  async function loadMessages() {
    if (!selectedChat) return;

    if (pollingTimer) clearTimeout(pollingTimer);

    let url = `/api/chat/${selectedChat.id}/messages`;
    if (lastTimestamp) url += `?after=${lastTimestamp}`;

    const res = await fetch(url);
    if (!res.ok) {
      pollingTimer = setTimeout(loadMessages, 1000);
      return;
    }

    const data = await res.json();

    if (data.messages?.length > 0) {
      messages = [...messages, ...data.messages];
      lastTimestamp = data.messages[data.messages.length - 1].createdAt;

      fetch(`/api/chat/${selectedChat.id}/read`, { method: "POST" });
    }

    await tick();

    if (isInitialLoad) {
      scrollToBottom();
      requestAnimationFrame(scrollToBottom);
      isInitialLoad = false;
      forceScrollToBottom = false;
    } else if (forceScrollToBottom) {
      scrollToBottomSmooth();
      forceScrollToBottom = false;
    } else {
      if (!userScrolledUp) {
        scrollToBottomSmooth();
      }
    }

    loadChats();
    pollingTimer = setTimeout(loadMessages, 1000);
  }

  async function sendMessage(content: string) {
    if ((!content.trim() && !selectedFile) || !selectedChat) return;

    const chatIdLocal = selectedChat.id;

    const form = new FormData();
    if (content.trim()) form.append("content", content);
    if (selectedFile) form.append("file", selectedFile);

    await fetch(`/api/chat/${chatIdLocal}/send`, {
      method: "POST",
      body: form,
    });

    inputText = "";
    selectedFile = null;

    await tick();

    const textarea = document.querySelector(
      ".input-area textarea"
    ) as HTMLTextAreaElement;
    if (textarea) textarea.style.height = "34px";

    if (!selectedChat || selectedChat.id !== chatIdLocal) return;

    userScrolledUp = false;
    forceScrollToBottom = true;

    loadMessages();
  }

  function submit() {
    sendMessage(inputText);
  }

  // ---------- mount ----------
  onMount(() => {
    const updateMobile = () => (isMobile = window.innerWidth < 768);
    updateMobile();
    window.addEventListener("resize", updateMobile);

    (async () => {
      await loadChats();

      // если chatId пришёл в props — открываем его
      if (chatId) {
        const target = chats.find((c) => c.id == chatId);
        if (target) {
          // ✅ если открываем ивент-чат — сразу переключаем вкладку
          activeTab = isEventChat(target) ? "event" : "dm";
          await openChat(target);
          return;
        }
      }

      // ✅ иначе: если есть ивенты — показываем лички по умолчанию, но это можно поменять
      activeTab = "dm";
    })();

    return () => {
      window.removeEventListener("resize", updateMobile);
    };
  });

  onDestroy(() => {
    if (pollingTimer) clearTimeout(pollingTimer);
    if (statusInterval) clearInterval(statusInterval);
  });
</script>

<div class="chat-wrapper">
  <!-- LEFT SIDEBAR -->
  <aside class="sidebar {isMobile && selectedChat ? 'hidden' : ''}">
    <h3 class="sidebar-title">Сообщения</h3>

    <!-- TABS: Личные / Ивенты -->
    <div class="sidebar-tabs">
      <button
        class="sidebar-tab"
        class:active={activeTab === "dm"}
        on:click={() => (activeTab = "dm")}
      >
        Личные
      </button>

      <button
        class="sidebar-tab"
        class:active={activeTab === "event"}
        on:click={() => (activeTab = "event")}
      >
        Ивенты
      </button>
    </div>

    <div class="chat-list">
      {#each visibleChats as chat}
        <div
          class="chat-list-item {selectedChat?.id === chat.id ? 'active' : ''}"
          on:click={() => openChat(chat)}
        >
          <!-- avatar (event/user) -->
          <img class="chat-avatar" src={getChatAvatar(chat)} alt="avatar" />

          <div class="chat-info">
            <div class="chat-name">{getChatTitle(chat)}</div>

            {#if chat.event?.date}
              <!-- optional: дата ивента маленькой строкой -->
              <div class="chat-meta">
                {new Date(chat.event.date).toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            {/if}

            <div class="chat-preview">{getChatPreview(chat)}</div>
          </div>

          {#if chat.unreadCount > 0}
            <span class="chat-unread">{chat.unreadCount}</span>
          {/if}
        </div>
      {/each}

      {#if visibleChats.length === 0}
        <div class="chat-empty">
          {activeTab === "dm" ? "Нет личных чатов" : "Нет чатов ивентов"}
        </div>
      {/if}
    </div>
  </aside>

  <!-- RIGHT SIDE -->
  <main class="chat-view">
    {#if selectedChat}
      <div class="chat-header">
        {#if isMobile && selectedChat}
          <button class="back-btn" on:click={() => (selectedChat = null)}>
            ←
          </button>
        {/if}

        <!-- header avatar: event/user -->
        <img
          src={getChatAvatar(selectedChat)}
          alt="Avatar"
          class="avatar-img"
        />

        <div class="header-info">
          <div class="header-name">{getChatTitle(selectedChat)}</div>

          {#if selectedChat.event?.date}
            <div class="header-status">
              {new Date(selectedChat.event.date).toLocaleDateString("ru-RU", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })}
            </div>
          {:else if status}
            <div class="header-status">{status}</div>
          {/if}
        </div>
      </div>

      <div
        class="messages"
        bind:this={messagesContainer}
        on:scroll={handleScroll}
      >
        {#each messages as msg}
          {#if msg.type === "transfer"}
            <TransferMessage {msg} />
          {:else}
            <div class="msg-row {msg.isMine ? 'mine' : 'their'}">
              {#if !msg.isMine}
                <img
                  class="msg-avatar clickable"
                  src={getMessageAvatar(msg)}
                  alt="avatar"
                  on:click={() => openMember(msg.sender.id)}
                />
              {/if}

              <div class="msg-bubble">
                {#if !msg.isMine && msg.sender?.info?.name}
                  <div
                    class="msg-sender"
                    on:click={() => openMember(msg.sender.id)}
                  >
                    {msg.sender.info.name}
                  </div>
                {/if}

                {#if isImage(msg)}
                  <div class="img-wrapper">
                    <img
                      src={`/api/photo/${msg.content.split("/").pop()}`}
                      alt="image"
                      class="msg-image"
                    />
                    <div class="msg-footer">
                      <a href={msg.content} download class="download-inline">
                        Скачать
                      </a>
                    </div>
                  </div>
                {:else if isFile(msg)}
                  <a class="msg-file" href={msg.content} download>
                    <ion-icon name="document-outline"></ion-icon>
                    <span>{msg.content.split("/").pop()}</span>
                  </a>
                {:else}
                  <span>{msg.content}</span>
                {/if}

                <div class="msg-time">
                  {new Date(msg.createdAt).toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {#if msg.isMine}
                <img
                  class="msg-avatar"
                  src={getMessageAvatar(msg)}
                  alt="avatar"
                />
              {/if}
            </div>
          {/if}
        {/each}
      </div>

      <div class="input-area">
        <input
          type="file"
          bind:this={fileInput}
          on:change={handleFile}
          style="display:none;"
        />

        <button class="attach-btn" on:click={() => fileInput?.click()}>
          <ion-icon name="document-attach-outline"></ion-icon>
        </button>

        <textarea
          bind:value={inputText}
          rows="1"
          placeholder="Сообщение..."
          on:input={autoResize}
        />

        <button class="send-btn" on:click={submit}>➤</button>
      </div>

      {#if selectedFile}
        <div class="file-chip">
          {selectedFile.name}
          <span class="remove-file" on:click={() => (selectedFile = null)}>
            ✖
          </span>
        </div>
      {/if}
    {:else}
      <div class="chat-placeholder">Choose chat</div>
    {/if}
  </main>
</div>

<style>
  .chat-wrapper {
    position: absolute; /* было flex/height — меняем */
    inset: 0;
    display: flex;
    min-height: 420px;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;

    background: linear-gradient(180deg, #cdd5ff 0%, #7a88f0 100%);
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  /* ===== Buttons / Upload ===== */
  .attach-btn {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    border-radius: 10px;
    background: #6366f1;
    border: 1px solid #4f46e5;
    color: white;
    cursor: pointer;
    transition: 0.15s;
    padding: 0;
  }

  .attach-btn ion-icon {
    font-size: 22px;
  }

  .attach-btn:hover {
    background: #4f46e5;
  }

  .file-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #e5e7eb;
    color: #111827;
    padding: 6px 10px;
    border-radius: 10px;
    margin: 6px 12px;
    font-size: 13px;
    border: 1px solid #cbd5e1;
  }

  .remove-file {
    cursor: pointer;
    font-weight: bold;
    opacity: 0.7;
  }

  .remove-file:hover {
    opacity: 1;
  }

  /* ===== Message content ===== */
  .img-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
  }

  .msg-image {
    max-width: 230px;
    border-radius: 12px;
    object-fit: cover;
  }

  .msg-avatar {
    width: 30px;
    height: 30px;
    border-radius: 999px;
    object-fit: cover;
    border: 1px solid #e2e8f0;
    flex: 0 0 auto;
    margin-bottom: 2px;
  }

  .msg-avatar.clickable {
    cursor: pointer;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
  }

  .msg-avatar.clickable:hover {
    transform: scale(1.05);
    box-shadow: 0 0 0 2px #c7d2fe;
  }

  /* Линия внизу: дата + скачать */
  .msg-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    font-size: 10px;
    opacity: 0.8;
    padding-right: 4px;
  }

  .download-inline {
    font-size: 10px;
    text-decoration: none;
    opacity: 0.8;
    color: inherit;
  }

  .download-inline:hover {
    text-decoration: underline;
    opacity: 1;
  }

  .msg-file {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    font-size: 14px;
  }

  .msg-file ion-icon {
    font-size: 22px;
  }

  .msg-sender {
    font-size: 12px;
    font-weight: 600;
    color: #4f46e5;
    margin-bottom: 4px;
    cursor: pointer;
  }

  .msg-sender:hover {
    text-decoration: underline;
  }

  /* ===== Sidebar ===== */
  .sidebar {
    width: 310px;
    background: rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(10px);
    padding: 12px 0;
    height: 100%; /* занимает всю высоту chat-wrapper */
    min-height: 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(255, 255, 255, 0.25);
  }

  .sidebar-title {
    font-size: 19px;
    font-weight: 700;
    padding: 0 20px 10px;
    color: #2d2d2d;
  }

  /* Tabs: Личные / Ивенты */
  .sidebar-tabs {
    display: flex;
    gap: 10px;
    padding: 0 20px 12px;
  }

  .sidebar-tab {
    flex: 1;
    height: 34px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.25);
    color: #111;
    font-weight: 700;
    cursor: pointer;
    transition: 0.15s;
  }

  .sidebar-tab:hover {
    background: rgba(255, 255, 255, 0.35);
  }

  .sidebar-tab.active {
    background: rgba(255, 255, 255, 0.6);
    border-color: rgba(99, 102, 241, 0.8);
  }

  .chat-list {
    flex: 1;
    min-height: 0; /* ✅ добавить */
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  .chat-list-item {
    padding: 12px 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;

    border-radius: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.25);

    background: transparent;
    transition: 0.15s;
  }

  .chat-list-item:hover {
    background: rgba(255, 255, 255, 0.45);
  }

  .chat-list-item.active {
    background: rgba(255, 255, 255, 0.55);
    border-left: 4px solid #6366f1;
  }

  .chat-avatar {
    width: 42px;
    height: 42px;
    border-radius: 999px;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.35);
    flex: 0 0 auto;
  }

  .chat-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0; /* важно для ellipsis */
    flex: 1;
  }

  .chat-name {
    font-weight: 600;
    font-size: 15px;
    color: #1a1a1a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chat-meta {
    font-size: 11px;
    opacity: 0.6;
    margin-top: -2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chat-preview {
    font-size: 13px;
    color: #444;
    opacity: 0.7;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    display: block;
  }

  .chat-unread {
    background: #ef4444;
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 12px;
    margin-left: auto;
    flex: 0 0 auto;
  }

  .chat-empty {
    padding: 16px 20px;
    opacity: 0.7;
    font-size: 13px;
  }

  /* ===== Chat header ===== */
  .chat-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .chat-header .avatar-img {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  }

  .header-info {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
    min-width: 0;
  }

  .header-name {
    font-size: 17px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-status {
    font-size: 10px;
    margin-top: 2px;
    opacity: 0.85;
  }

  /* ===== Chat view ===== */
  .chat-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0; /* важно */
  }

  .chat-placeholder {
    margin: auto;
    opacity: 0.5;
    font-size: 18px;
  }

  .messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .msg-row {
    display: flex;
    align-items: flex-end;
    gap: 14px; /* ✅ чуть больше воздуха между аватаром и bubble */
    margin: 2px 0;
  }

  .msg-row.mine {
    margin-left: auto;
    justify-content: flex-end;
  }

  .msg-bubble {
    position: relative;
    display: inline-flex;
    flex-direction: column;

    min-width: 130px;
    max-width: 75%;
    padding: 6px 10px 20px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.3;
    word-wrap: break-word;
    word-break: break-word;
    white-space: pre-wrap;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  }

  .msg-row:not(.mine) .msg-bubble {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    color: #111827;
  }

  .msg-row.mine .msg-bubble {
    background: #6366f1;
    border: 1px solid #4f46e5;
    color: white;
  }

  .msg-time {
    position: absolute;
    bottom: 3px;
    right: 8px;
    font-size: 9px;
    opacity: 0.6;
  }

  /* ===== Input ===== */
  .input-area {
    position: sticky;
    bottom: 0;
    z-index: 5;

    border-top: 1px solid var(--border-color, #ddd);
    background: #fafafa;

    padding: 8px 12px;
    display: flex;
    gap: 10px;
    align-items: center;
    border-radius: 0;
  }

  .input-area textarea {
    flex: 1;
    padding: 6px 10px;
    font-size: 14px;
    min-height: 34px;
    max-height: 120px;
    resize: none;
    border-radius: 10px;
    border: 1px solid #000000;
    background: white;
    line-height: 1.35;
    overflow-y: auto;
    transition: 0.15s;
  }

  .input-area textarea:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px #6366f133;
    outline: none;
  }

  .input-area button {
    width: 40px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    line-height: 0;
    border-radius: 10px;
    background: #6366f1;
    border: 1px solid #4f46e5;
    color: white;
    cursor: pointer;
    transition: 0.15s;
  }

  .input-area button:hover {
    background: #4f46e5;
  }

  .input-area button:active {
    transform: scale(0.96);
  }

  @media (max-width: 768px) {
    .chat-wrapper {
      position: absolute; /* важно: всё равно экран внутри main */
      inset: 0;
      flex-direction: column;
      max-width: 100%;
      margin: 0;
      border: none;
      overflow: hidden;
      min-height: 420px;
    }

    .sidebar {
      display: flex;
      flex-direction: column; /* ✅ */
      width: 100%;
      border: none;
      border-bottom: 1px solid #ddd;
      padding: 12px 14px;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }

    .chat-list {
      flex: 1;
      min-height: 0; /* ✅ добавить */
      overflow-y: auto;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }

    .sidebar.hidden {
      display: none;
    }

    /* BACK */
    .back-btn {
      background: transparent;
      border: none;
      font-size: 24px;
      margin-right: 6px;
      cursor: pointer;
      color: rgb(0, 0, 0);
    }

    .chat-view {
      flex: 1;
      display: flex;
      flex-direction: column;

      height: 100%; /* ✅ важно */
      min-height: 0; /* ✅ важно */
      overflow: hidden; /* ✅ чтобы страница/контейнер не скроллился */
    }

    .messages {
      flex: 1;
      min-height: 0; /* ✅ must-have для scroll внутри flex */
      overflow-y: auto; /* ✅ скролл только тут */

      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;

      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }

    .input-area {
      flex: 0 0 auto; /* ✅ не растягивается */
      position: relative; /* ✅ никакого sticky */

      border-top: 1px solid var(--border-color, #ddd);
      background: #fafafa;

      padding: 8px 12px;
      display: flex;
      gap: 10px;
      align-items: center;
      z-index: 5;
    }

    .input-area textarea {
      font-size: 14px;
      min-height: 32px;
    }

    .sidebar-tabs {
      padding: 0 0 12px;
    }

    .chat-list-item {
      padding: 12px 0;
    }
  }
</style>
