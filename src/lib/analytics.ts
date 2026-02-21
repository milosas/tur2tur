/**
 * Meta (Facebook) Pixel event helpers.
 * Safe to call even if Pixel hasn't loaded or user declined cookies.
 */

type FbqParams = Record<string, string | number | string[]>;

function fbq(event: string, params?: FbqParams) {
  if (typeof window !== "undefined" && (window as any).fbq) {
    if (params) {
      (window as any).fbq("track", event, params);
    } else {
      (window as any).fbq("track", event);
    }
  }
}

export function trackCompleteRegistration() {
  fbq("CompleteRegistration");
}

export function trackLead() {
  fbq("Lead");
}

export function trackInitiateCheckout(plan: string, value: number) {
  fbq("InitiateCheckout", {
    content_name: plan === "single" ? "Single Tournament" : "Unlimited Subscription",
    content_ids: [plan],
    value,
    currency: "EUR",
  });
}

export function trackPurchase(plan: string, value: number) {
  fbq("Purchase", {
    content_name: plan === "single" ? "Single Tournament" : "Unlimited Subscription",
    content_ids: [plan],
    value,
    currency: "EUR",
  });
}

export function trackViewContent(name: string, id: string) {
  fbq("ViewContent", {
    content_name: name,
    content_type: "product",
    content_ids: [id],
  });
}
