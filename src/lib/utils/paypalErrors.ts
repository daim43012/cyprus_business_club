export function isInstrumentDeclined(payload: any): boolean {
  return Boolean(
    payload?.paypal?.details?.some(
      (d: any) => d?.issue === "INSTRUMENT_DECLINED"
    )
  );
}

export function getPaypalErrorMessage(payload: any): string {
  const issue =
    payload?.paypal?.details?.[0]?.issue ||
    payload?.paypal?.details?.find?.((d: any) => d?.issue)?.issue ||
    "";

  switch (issue) {
    case "INSTRUMENT_DECLINED":
      return "Payment was declined. Please try another payment method.";
    case "INSUFFICIENT_FUNDS":
      return "Insufficient funds. Please choose another payment method.";
    case "TRANSACTION_REFUSED":
      return "Transaction was refused. Please try another card or method.";
    case "PAYER_ACTION_REQUIRED":
      return "Additional payer action is required. Please try again.";
    default:
      return "Payment could not be completed. Please try again.";
  }
}
