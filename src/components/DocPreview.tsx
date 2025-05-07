
import React from "react";
import { Card } from "@/components/ui/card";

interface DocPreviewProps {
  html: string;
}

const DocPreview: React.FC<DocPreviewProps> = ({ html }) => {
  return (
    <Card className="overflow-hidden">
      <iframe
        srcDoc={html}
        title="Documentation Preview"
        className="w-full h-[600px] border-0"
        sandbox="allow-same-origin"
      />
    </Card>
  );
};

export default DocPreview;
