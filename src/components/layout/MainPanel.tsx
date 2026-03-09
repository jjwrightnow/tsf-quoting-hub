import { useAppStore } from '@/stores/appStore';
import { useSignStore } from '@/stores/signStore';
import ChatThread from '@/components/chat/ChatThread';
import QuoteDetail from '@/components/quote/QuoteDetail';
import ChatErrorBoundary from '@/components/chat/ChatErrorBoundary';

const MainPanel = () => {
  const wizardActive = useAppStore((s) => s.wizardActive);
  const activeQuoteId = useAppStore((s) => s.activeQuoteId);
  const chatPhase = useSignStore((s) => s.chatPhase);

  console.log('[MainPanel] render — wizardActive:', wizardActive, 'activeQuoteId:', activeQuoteId, 'chatPhase:', chatPhase);

  if (activeQuoteId && !wizardActive && chatPhase === 'welcome') {
    return <QuoteDetail quoteId={activeQuoteId} />;
  }

  // Always show ChatThread (welcome phase shows WelcomeActions inline)
  return (
    <ChatErrorBoundary>
      <ChatThread />
    </ChatErrorBoundary>
  );
};

export default MainPanel;
