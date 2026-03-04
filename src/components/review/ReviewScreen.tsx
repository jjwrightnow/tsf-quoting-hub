import { useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import ArtworkViewer from './ArtworkViewer';
import FlagBot from './FlagBot';
import { useReviewStore } from '@/stores/reviewStore';
import { invokeWithAuth } from '@/lib/supabase';

const ReviewScreen = () => {
  const setAutocompleteOptions = useReviewStore((s) => s.setAutocompleteOptions);

  // Load autocomplete options on mount
  useEffect(() => {
    invokeWithAuth('get-catalog-bundle')
      .then((res) => {
        if (res?.autocompleteOptions) {
          useReviewStore.getState().setAutocompleteOptions(res.autocompleteOptions);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background">
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={55} minSize={25}>
          <ArtworkViewer />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={45} minSize={25}>
          <FlagBot />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ReviewScreen;
