import { StatePanel } from "@/components/shared/state-panel";

type ResultsBannerProps = {
  title: string;
  description: string;
  tone: "pending" | "live" | "official";
};

export function ResultsBanner({
  title,
  description,
  tone
}: ResultsBannerProps) {
  const eyebrow =
    tone === "official"
      ? "Official Results"
      : tone === "live"
        ? "Live Results"
        : "Results Pending";

  const panelTone =
    tone === "official" ? "success" : tone === "live" ? "neutral" : "warning";

  return (
    <StatePanel
      eyebrow={eyebrow}
      title={title}
      description={description}
      tone={panelTone}
    />
  );
}
