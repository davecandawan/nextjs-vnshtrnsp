import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

const VidalyticsVideo = () => {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    const checkVidalytics = () => {
      // @ts-ignore
      if (window.Vidalytics && window.Vidalytics.Embed) {
        setScriptReady(true);
        return true;
      }
      return false;
    };

    // Check if already loaded
    if (checkVidalytics()) return;

    // Set up a mutation observer to watch for script loading
    const observer = new MutationObserver(() => {
      if (checkVidalytics()) {
        observer.disconnect();
      }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    // Also check periodically as a fallback
    const interval = setInterval(() => {
      if (checkVidalytics()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!scriptReady || !videoContainerRef.current) return;

    try {
      // Clear any existing content
      if (videoContainerRef.current) {
        videoContainerRef.current.innerHTML = '';
      }

      // Add a small delay to ensure the DOM is ready
      const timer = setTimeout(() => {
        // @ts-ignore - We've already checked that Vidalytics exists
        const player = new window.Vidalytics.Embed();
        player.run('vidalytics_embed_i5y1U54pnBEf5Ea0');
      }, 100);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error initializing Vidalytics player:', error);
    }
  }, [scriptReady]);

  return (
    <div className="w-full max-w-[1000px] mx-auto relative  overflow-hidden shadow-md bg-black aspect-video -mt-2">
      {/* Load the Vidalytics loader script */}
      <Script
        id="vidalytics-loader"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function (v, i, d, a, l, y, t, c, s) {
                y='_'+d.toLowerCase();c=d+'L';
                if(!v[d]){v[d]={};}
                if(!v[c]){v[c]={};}
                if(!v[y]){v[y]={};}
                var vl='Loader',vli=v[y][vl],vsl=v[c][vl + 'Script'],vlf=v[c][vl + 'Loaded'],ve='Embed';
                if (!vsl){vsl=function(u,cb){
                    if(t){cb();return;}
                    s=i.createElement("script");
                    s.type="text/javascript";
                    s.async=1;
                    s.src=u;
                    s.onload=function(){vlf=1;cb();};
                    i.getElementsByTagName("head")[0].appendChild(s);
                };}
                vsl(l+'loader.min.js',function(){
                    if(!vli){var vlc=v[c][vl];vli=new vlc();}
                    vli.loadScript(l+'player.min.js',function(){
                        var vec=v[d][ve];
                        t=new vec();
                        t.run(a);
                        // Dispatch event when Vidalytics is loaded
                        window.dispatchEvent(new Event('vidalytics:loaded'));
                    });
                });
            })(window, document, 'Vidalytics', 'vidalytics_embed_i5y1U54pnBEf5Ea0', 'https://quick.vidalytics.com/embeds/IgKBDqAD/i5y1U54pnBEf5Ea0/');
          `,
        }}
      />

      {/* Video container */}
      <div
        id="vidalytics_embed_i5y1U54pnBEf5Ea0"
        ref={videoContainerRef}
        className="relative w-full h-full min-h-[300px]"
      />
    </div>
  );
};

export default VidalyticsVideo;
