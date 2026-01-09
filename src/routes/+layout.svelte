<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import Header from "../components/header.svelte";
  import Footer from "../components/footer.svelte";

  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  const queryClient = new QueryClient();

  $: isChatRoute = $page.url.pathname.startsWith("/chat");

  onMount(() => {
    const interval = setInterval(async () => {
      try {
        await fetch("/api/user/online", { method: "POST" });
      } catch (err) {
        console.warn("⚠️ Failed to update online status:", err);
      }
    }, 30000);

    fetch("/api/user/online", { method: "POST" });

    window.addEventListener("beforeunload", () => {
      navigator.sendBeacon("/api/user/online");
    });

    return () => clearInterval(interval);
  });
</script>

<div class="layout-wrapper">
    <Header />

  <QueryClientProvider client={queryClient}>
    <main class="app-main">
      <slot />
    </main>
  </QueryClientProvider>

  {#if !isChatRoute}
    <Footer />
  {/if}
</div>

<style>
  .layout-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  main.app-main {
    flex: 1;
    position: relative;
    overflow: hidden;
  }
</style>
