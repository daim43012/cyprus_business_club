<script lang="ts">
  import { onMount, tick } from "svelte";

  export let symbol: string;    // например "POL"
  export let quote: string;     // например "USDT" или "USDC"
  export let interval = "5m";   // можно менять на 1m/5m/1h
  export let limit = 50;        // количество свечей

  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let prices: number[] = [];

  let loading = true;
  let intervalId: number | null = null;

  async function initContext() {
    await tick();
    for (let i = 0; i < 5; i++) {
      if (canvas) {
        ctx = canvas.getContext("2d");
        if (ctx) return true;
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    return false;
  }

  async function loadCandles() {
    const pair = `${symbol}${quote}`.toUpperCase();

    const url = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data)) return;

    prices = data.map((c: any[]) => parseFloat(c[4])); // close
  }

  function draw() {
    if (!ctx || !canvas || prices.length === 0) return;

    const c = ctx;
    const w = canvas.width;
    const h = canvas.height;

    c.clearRect(0, 0, w, h);

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const trendUp = prices[prices.length - 1] > prices[0];
    const lineColor = trendUp ? "#00ff00" : "#ff4d4d";
    const fillColor = trendUp
      ? "rgba(0,255,0,0.18)"
      : "rgba(255,77,77,0.18)";

    // линия
    c.beginPath();
    c.lineWidth = 2;
    c.strokeStyle = lineColor;

    prices.forEach((price, i) => {
      const x = (i / (prices.length - 1)) * w;
      const y = h - ((price - min) / range) * h;
      i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
    });

    c.stroke();

    // заливка под линией
    c.lineTo(w, h);
    c.lineTo(0, h);
    c.closePath();
    c.fillStyle = fillColor;
    c.fill();
  }

onMount(() => {
  (async () => {
    const ok = await initContext();
    if (!ok) return;

    await loadCandles();
    draw();
    loading = false;

    intervalId = window.setInterval(async () => {
      await loadCandles();
      draw();
    }, 5000);
  })();

  return () => {
    if (intervalId) clearInterval(intervalId);
  };
});

</script>

<canvas bind:this={canvas} width="150" height="50"></canvas>

{#if loading}
  <div style="opacity:0.6;font-size:0.7rem;">Загрузка графика…</div>
{/if}

<style>
  canvas {
    display: block;
  }
</style>
