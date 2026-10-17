export type CoverEnquiry = {
  text: string;
  name: string;
  age: string;
  topic: string;
  personality: string;
  previewUrl: string;
  frontImg: string;
  backImg: string;
};

type LeadFields = Pick<CoverEnquiry, "name" | "age" | "topic" | "personality" | "previewUrl" | "frontImg" | "backImg">;

let current: CoverEnquiry | null = null;
const listeners = new Set<() => void>();

export function setCoverEnquiry(next: CoverEnquiry | null) {
  current = next;
  for (const listener of listeners) listener();
}

export function getCoverEnquiry() {
  return current;
}

export function subscribeCoverEnquiry(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Studio notify only. Does not call the WhatsApp Cloud API. */
export function postPreviewLead(lead: LeadFields, conversationStarted: boolean) {
  if (!lead.name.trim() || !lead.previewUrl.trim()) return;
  void fetch("/api/preview-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: lead.name,
      age: lead.age,
      topic: lead.topic,
      personality: lead.personality,
      previewUrl: lead.previewUrl,
      frontImg: lead.frontImg,
      backImg: lead.backImg,
      conversationStarted,
    }),
  }).catch(() => {
    // Tracking must not block the WhatsApp handoff.
  });
}
