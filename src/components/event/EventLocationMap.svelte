<script lang="ts">
  import { onMount } from "svelte";
  import "leaflet/dist/leaflet.css";

  export let data: any;
  const event = data.event;

  let coords = [event.latitude ?? 52.52, event.longitude ?? 13.405];
  let mapContainer: HTMLElement;

  onMount(() => {
    (async () => {
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      const L = leaflet.default;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });

      const map = L.map(mapContainer).setView(coords, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      L.marker(coords).addTo(map);
    })();
  });
</script>

<div class="location-block">
  <h2>📍 Локация</h2>
  <p class="address">{event.location}</p>

  <div bind:this={mapContainer} class="map"></div>
</div>

<style>
  .location-block {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 14px;
  }

  h2 {
    margin: 0 0 8px;
    font-size: 18px;
    color: #111827;
  }

  .address {
    margin: 0 0 10px;
    color: #4b5563;
  }

  .map {
    width: 100%;
    height: 320px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
  }
</style>
