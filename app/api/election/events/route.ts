import { getElectionStatus } from "@/lib/election/election-service";
import { subscribeToElectionStatus } from "@/lib/election/status-events";
import type { ElectionStatus } from "@/lib/election/status";

export const dynamic = "force-dynamic";

const KEEP_ALIVE_INTERVAL_MS = 15000;

function serializeStatus(status: ElectionStatus) {
  return `event: status\ndata: ${JSON.stringify({ status })}\n\n`;
}

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const requestedStatus = new URL(request.url).searchParams.get("status");
  let knownStatus: ElectionStatus | null =
    requestedStatus === "NOT_STARTED" ||
    requestedStatus === "OPEN" ||
    requestedStatus === "CLOSED"
      ? requestedStatus
      : null;

  let cleanup = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let stopped = false;
      let unsubscribe = () => {};
      let intervalId: ReturnType<typeof setInterval> | null = null;

      const stop = () => {
        if (stopped) {
          return;
        }

        stopped = true;
        if (intervalId) {
          clearInterval(intervalId);
        }
        unsubscribe();
        request.signal.removeEventListener("abort", handleAbort);
      };

      const sendStatus = (status: ElectionStatus) => {
        if (stopped || status === knownStatus) {
          return;
        }

        knownStatus = status;
        controller.enqueue(encoder.encode(serializeStatus(status)));
      };

      const handleAbort = () => {
        stop();
        controller.close();
      };

      unsubscribe = subscribeToElectionStatus(sendStatus);
      intervalId = setInterval(() => {
        if (!stopped) {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        }
      }, KEEP_ALIVE_INTERVAL_MS);

      request.signal.addEventListener("abort", handleAbort);

      cleanup = stop;

      void getElectionStatus()
        .then(sendStatus)
        .catch(() => {
          stop();
          controller.close();
        });
    },
    cancel() {
      cleanup();
    }
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
