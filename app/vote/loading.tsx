import { LoadingPanel } from "@/components/shared/loading-panel";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
      <LoadingPanel label="Loading the ballot..." />
    </main>
  );
}
