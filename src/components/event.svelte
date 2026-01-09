<script lang="ts">
  import "leaflet/dist/leaflet.css";
  // import ExchangeFormCurrencies from "./Exchange/ExchangeFormCurrencies.svelte";
  import ContextAssistant from "./ContextAssistant.svelte";
  import EventHeader from "./event/EventHeader.svelte";
  import EventAttendees from "./event/EventAttendees.svelte";
  import EventAgenda from "./event/EventAgenda.svelte";
  import EventLocationMap from "./event/EventLocationMap.svelte";
  import Paypal from "./paypal.svelte";

  export let data: any;
  const event = data?.event;
</script>

<section class="wrapper">
  <EventHeader {data} />
  <EventAttendees {data} />
  <EventAgenda {data} />  
  <!-- <Paypal eventId={event.id}/> -->
  <EventLocationMap {data} />

  <!-- <ExchangeFormCurrencies
    type="DEPOSIT"
    amount="6"
    currencyCodeChain="POL-Polygon"
    address="0xad98403fe174a46e3e4d0793af579c23b666efed"
  /> -->
  <ContextAssistant
    contextKey="event"
    payload={event}
    title="Помощник по ивенту"
  />
</section>

<style>
.wrapper {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

</style>
