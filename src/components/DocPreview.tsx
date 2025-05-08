
import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface DocPreviewProps {
  html: string;
}

const DocPreview: React.FC<DocPreviewProps> = ({ html }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // When the HTML content changes, ensure the iframe is resized properly
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      
      // Function to adjust iframe height based on content
      const resizeIframe = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            // Allow time for content to render
            setTimeout(() => {
              iframe.style.height = `${Math.max(600, iframeDoc.documentElement.scrollHeight)}px`;
              console.log("Resized iframe to:", iframe.style.height);
            }, 200);
          }
        } catch (e) {
          console.error("Error resizing iframe:", e);
        }
      };

      // Add load event to iframe
      iframe.onload = resizeIframe;
      
      // Apply initial height after a short delay
      setTimeout(resizeIframe, 300);
    }
  }, [html]);

  return (
    <Card className="overflow-hidden">
      <iframe
        ref={iframeRef}
        srcDoc={html}
        title="Documentation Preview"
        className="w-full min-h-[600px] border-0 transition-all duration-200"
        sandbox="allow-same-origin"
        onLoad={(e) => {
          // Add basic navigation within the iframe
          try {
            const iframe = e.currentTarget;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            
            if (iframeDoc) {
              // Add click event listeners to anchor tags
              const anchors = iframeDoc.querySelectorAll('a');
              anchors.forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                  const href = anchor.getAttribute('href');
                  if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = iframeDoc.getElementById(targetId);
                    if (targetElement) {
                      targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                });
              });
              
              console.log("DocPreview iframe loaded with content");
            }
          } catch (e) {
            console.error("Error setting up iframe navigation:", e);
          }
        }}
      />
    </Card>
  );
};

export default DocPreview;
