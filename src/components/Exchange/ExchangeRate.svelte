<script lang="ts">
  import Decimal from "decimal.js";

  export let currencyFrom: string = "";
  export let currencyTo: string = "";
  export let reverse: boolean = false;
  export let rate: Decimal | string = "0";
</script>

<div class="flex justify-between text-black text-[13px] px-6 py-3.5">
  <div class="w-4/5">
    1 {currencyFrom} ≈ {reverse
      ? new Decimal(1).div(rate || 1).toString()
      : new Decimal(rate || 0).toString()}
    {currencyTo}
  </div>
</div>
