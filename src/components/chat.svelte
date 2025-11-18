<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { goto } from "$app/navigation";
  import { onlineStatus } from "$lib/utils/onlineStatus";

  export let chatId: string | null = null;

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

  function handleFile(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    selectedFile = file;
  }

  function autoResize(e: any) {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

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
  function isImage(msg: any) {
    if (typeof msg.content !== "string") return false;

    const ext = msg.content.toLowerCase().split(".").pop();
    return ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);
  }
  function isFile(msg: any) {
    if (typeof msg.content !== "string") return false;

    if (!msg.content.startsWith("/uploads/")) return false;

    if (isImage(msg)) return false;

    return true;
  }

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

    if (selectedChat?.otherUser?.lastOnline) {
      status = onlineStatus(selectedChat.otherUser.lastOnline);
    }

    if (statusInterval) clearInterval(statusInterval);

    statusInterval = setInterval(async () => {
      if (!selectedChat) return;

      await loadChats();

      const updated = chats.find((c) => c.id === selectedChat.id);

      if (updated) {
        selectedChat = updated;

        if (selectedChat.otherUser?.lastOnline) {
          status = onlineStatus(selectedChat.otherUser.lastOnline);
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

    if (data.messages.length > 0) {
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

    const chatId = selectedChat.id;

    // --- Формируем FormData ---
    const form = new FormData();
    if (content.trim()) form.append("content", content);
    if (selectedFile) form.append("file", selectedFile);

    await fetch(`/api/chat/${chatId}/send`, {
      method: "POST",
      body: form,
    });

    // очистка
    inputText = "";
    selectedFile = null;

    await tick();

    // сброс textarea
    const textarea = document.querySelector(
      ".input-area textarea"
    ) as HTMLTextAreaElement;
    if (textarea) textarea.style.height = "34px";

    // если всё ещё в этом чате
    if (!selectedChat || selectedChat.id !== chatId) return;

    userScrolledUp = false;
    forceScrollToBottom = true;

    loadMessages();
  }

  function submit() {
    sendMessage(inputText);
  }

  onMount(async () => {
    await loadChats();

    if (chatId) {
      const target = chats.find((c) => c.id == chatId);
      if (target) {
        openChat(target);
      }
    }
    isMobile = window.innerWidth < 768;
    window.addEventListener("resize", () => {
      isMobile = window.innerWidth < 768;
    });
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

    <div class="chat-list">
      {#each chats as chat}
        <div
          class="chat-list-item {selectedChat?.id === chat.id ? 'active' : ''}"
          on:click={() => openChat(chat)}
        >
          <div class="chat-info">
            <div class="chat-name">
              {chat.otherUser?.info?.name || chat.otherUser?.email}
            </div>
            <div class="chat-preview">
              {chat.lastMessage || "Нет сообщений"}
            </div>
          </div>

          {#if chat.unreadCount > 0}
            <span class="chat-unread">{chat.unreadCount}</span>
          {/if}
        </div>
      {/each}
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

        <img
          src={selectedChat.otherUser?.info?.photo ||
            "https://api.dicebear.com/7.x/initials/svg?seed=" +
              (selectedChat.otherUser?.info?.name || "User")}
          alt="User"
          class="avatar-img"
        />

        <div class="header-info">
          <div class="header-name">
            {selectedChat.otherUser?.info?.name ||
              selectedChat.otherUser?.email}
          </div>

          <div class="header-status">
            {status}
          </div>
        </div>
      </div>

      <div
        class="messages"
        bind:this={messagesContainer}
        on:scroll={handleScroll}
      >
        {#each messages as msg}
          <div class="msg-row {msg.isMine ? 'mine' : ''}">
            <div class="msg-bubble">
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
          </div>
        {/each}
      </div>
      <div class="input-area">
        <!-- скрытый file input -->
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

        <button on:click={submit}>➤</button>
      </div>

      {#if selectedFile}
        <div class="file-chip">
          {selectedFile.name}
          <span class="remove-file" on:click={() => (selectedFile = null)}
            >✖</span
          >
        </div>
      {/if}
    {:else}
      <div class="chat-placeholder">Выберите чат</div>
    {/if}
  </main>
</div>

<style>
  .chat-wrapper {
    display: flex;
    height: 100dvh;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
    background: linear-gradient(180deg, #cdd5ff 0%, #7a88f0 100%);
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

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

  .sidebar {
    width: 310px;
    background: rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(10px);
    padding: 12px 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(255, 255, 255, 0.25);
  }

  .sidebar-title {
    font-size: 19px;
    font-weight: 700;
    padding: 0 20px 12px;
    color: #2d2d2d;
  }

  .chat-list {
    flex: 1;
    overflow-y: auto;
  }

  .chat-list-item {
    padding: 14px 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;

    border-radius: 0; /* как Telegram */
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

  .chat-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .chat-name {
    font-weight: 600;
    font-size: 15px;
    color: #1a1a1a;
  }

  .chat-preview {
    font-size: 13px;
    color: #444;
    opacity: 0.7;
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chat-unread {
    background: #6366f1;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 20px;
  }

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
  }

  .header-name {
    font-size: 17px;
    font-weight: 600;
  }

  .header-status {
    font-size: 10px;
    margin-top: 2px;
  }

  .chat-list-item.active {
    border-width: 2px;
    background: #eef2ff;
  }

  .chat-unread {
    background: #ef4444;
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 12px;
    margin-left: auto;
  }

  .chat-name {
    font-weight: 600;
    font-size: 15px;
  }

  .chat-preview {
    font-size: 13px;
    opacity: 0.6;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
    display: block;
  }

  .chat-view {
    flex: 1;
    display: flex;
    flex-direction: column;
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
    max-width: 70%;
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

  .input-area {
    border-top: 1px solid var(--border-color, #ddd);
    padding: 8px 12px;
    display: flex;
    gap: 10px;
    background: #fafafa;
    align-items: center;
    border-radius: 10px;
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
      flex-direction: column;
      height: 100vh;
      max-width: 100%;
      border: none;
      overflow: hidden;
    }

    /* --- SIDEBAR НА МОБИЛЬНОМ --- */
    .sidebar {
      display: block;
      width: 100%;
      border: none;
      border-bottom: 1px solid #ddd;
      padding: 12px 14px;
      overflow-y: auto;
      max-height: 100vh;
    }

    /* если выбран чат — скрываем список */
    .sidebar.hidden {
      display: none;
    }

    /* --- КНОПКА НАЗАД --- */
    .back-btn {
      background: transparent;
      border: none;
      font-size: 24px;
      margin-right: 6px;
      cursor: pointer;
      color: rgb(0, 0, 0);
    }

    /* --- CHAT VIEW --- */
    .chat-view {
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 60px);
    }

    /* сообщения растягиваются */
    .messages {
      padding: 14px;
      flex: 1;
      overflow-y: auto;
    }

    /* input area */
    .input-area {
      padding: 10px;
      border-radius: 0;
    }

    .input-area textarea {
      font-size: 14px;
      min-height: 32px;
    }
  }
</style>
