import { useState, useCallback, useRef, useEffect } from 'react';
import { useReviewStore } from '@/stores/reviewStore';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ArtworkViewer = () => {
  const artworkFiles = useReviewStore((s) => s.artworkFiles);
  const currentFileIndex = useReviewStore((s) => s.currentFileIndex);
  const currentPage = useReviewStore((s) => s.currentPage);
  const setCurrentFileIndex = useReviewStore((s) => s.setCurrentFileIndex);
  const setCurrentPage = useReviewStore((s) => s.setCurrentPage);

  const [fileUrls, setFileUrls] = useState<Record<number, string>>({});
  const [numPages, setNumPages] = useState<number>(1);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  const currentFile = artworkFiles[currentFileIndex];
  const isPdf = currentFile?.type === 'application/pdf' || currentFile?.name.toLowerCase().endsWith('.pdf');

  // Generate signed URLs
  useEffect(() => {
    artworkFiles.forEach((f, i) => {
      if (!fileUrls[i]) {
        supabase.storage.from('intake-assets').createSignedUrl(f.path, 3600).then(({ data }) => {
          if (data?.signedUrl) setFileUrls((prev) => ({ ...prev, [i]: data.signedUrl }));
        });
      }
    });
  }, [artworkFiles]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom((z) => Math.max(0.5, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1))));
    }
  }, []);

  const handleDoubleClick = () => setZoom(1);

  const url = fileUrls[currentFileIndex];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* File Tabs */}
      {artworkFiles.length > 1 && (
        <div className="flex gap-1 border-b border-border bg-card px-2 py-1">
          {artworkFiles.map((f, i) => (
            <button
              key={i}
              onClick={() => setCurrentFileIndex(i)}
              className={`truncate rounded px-2 py-1 text-xs transition-colors ${
                i === currentFileIndex ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      {/* Viewer */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      >
        {url ? (
          isPdf ? (
            <Document
              file={url}
              onLoadSuccess={({ numPages: n }) => setNumPages(n)}
              loading={<div className="flex h-full items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}
            >
              <Page
                pageNumber={currentPage}
                width={containerWidth * zoom}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          ) : (
            <div className="flex items-center justify-center p-4">
              <img
                src={url}
                alt={currentFile?.name}
                style={{ maxWidth: `${100 * zoom}%` }}
                className="max-h-full object-contain"
                draggable={false}
              />
            </div>
          )
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">Loading file…</div>
        )}
      </div>

      {/* PDF Navigation */}
      {isPdf && numPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-border bg-card px-2 py-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {numPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={currentPage >= numPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ArtworkViewer;
