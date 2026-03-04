import { useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import ArtworkViewer from './ArtworkViewer';
import FlagBot from './FlagBot';
import { useReviewStore } from '@/stores/reviewStore';
import { supabase } from '@/integrations/supabase/client';

const ReviewScreen = () => {
  const setAutocompleteOptions = useReviewStore((s) => s.setAutocompleteOptions);

  useEffect(() => {
    supabase
      .from('autocomplete_options')
      .select('category, option_value, display_label, search_terms')
      .eq('active', true)
      .then(({ data }) => {
        if (data) setAutocompleteOptions(data);
      });
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
