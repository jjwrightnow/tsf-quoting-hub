import { useAppStore } from '@/stores/appStore';
import { useSignStore } from '@/stores/signStore';
import WelcomeScreen from '@/components/chat/WelcomeScreen';
import ChatThread from '@/components/chat/ChatThread';
import QuoteDetail from '@/components/quote/QuoteDetail';

const MainPanel = () => {
  const wizardActive = useAppStore((s) => s.wizardActive);
  const activeQuoteId = useAppStore((s) => s.activeQuoteId);
  const chatPhase = useSignStore((s) => s.chatPhase);

  // Show ChatThread for wizard mode OR sign chat mode
  if (wizardActive || chatPhase !== 'welcome') {
    return <ChatThread />;
  }

  if (activeQuoteId) {
    return <QuoteDetail quoteId={activeQuoteId} />;
  }

  // Welcome phase shows ChatThread with WelcomeActions inline
  return <ChatThread />;
};

export default MainPanel;
