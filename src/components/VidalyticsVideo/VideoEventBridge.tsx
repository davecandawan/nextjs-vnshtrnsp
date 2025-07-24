import { useEffect } from 'react';

interface VideoEventBridgeProps {
  onShowContent: () => void;
  onFiveSeconds?: () => void; // Optional: for timer/exit pop
}

/**
 * This component listens for the Vidalytics video reaching 5 seconds.
 * It polls the video element's currentTime every 300ms, and triggers onFiveSeconds when reached.
 *
 * Usage: Place as a sibling to the VidalyticsVideo component, and pass the callback.
 */
export default function VideoEventBridge({ onShowContent, onFiveSeconds }: VideoEventBridgeProps) {
  useEffect(() => {
    // Helper to check if any element is currently fullscreen
    function isAnyElementFullscreen() {
      return (
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
    }

    // Handler for fullscreen exit
    function handleFullscreenChange() {
      // If previously fullscreen, and now not, trigger pop-up
      if (!isAnyElementFullscreen() && !triggered) {
        triggered = true;
        onShowContent();
      }
    }

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    let interval: NodeJS.Timeout | null = null;
    let triggered = false;
    let pollingStarted = false;
    let cleanupClick: (() => void) | null = null;

    function startTimer() {
      if (pollingStarted) return;
      pollingStarted = true;
      interval = setTimeout(() => {
        // 560 seconds = 560000 ms

        if (!triggered) {
          triggered = true;
          if (onFiveSeconds) {
            onFiveSeconds();
          } else {
            onShowContent();
          }
        }
      }, 560000);
    }

    // Listen for click on video or container
    // Wait for the container to appear, then attach click handler
    let pollInterval: NodeJS.Timeout | null = null;
    function tryAttachClickListener() {
      const container = document.getElementById('vidalytics_embed_i5y1U54pnBEf5Ea0');
      if (!container) {
        return;
      }

      const handleClick = () => {
        startTimer();
        container.removeEventListener('click', handleClick);
      };
      container.addEventListener('click', handleClick);
      cleanupClick = () => container.removeEventListener('click', handleClick);
      if (pollInterval) clearInterval(pollInterval);
    }
    pollInterval = setInterval(tryAttachClickListener, 300);
    // Try immediately in case it's already there
    tryAttachClickListener();

    // Clean up on unmount
    return () => {
      // Remove fullscreen listeners
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

      if (interval) clearTimeout(interval);
      if (cleanupClick) cleanupClick();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [onFiveSeconds]);

  return null;
}
