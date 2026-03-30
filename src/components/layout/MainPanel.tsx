import { useAppStore } from '@/stores/appStore';
import { useSignStore } from '@/stores/signStore';
import ChatThread from '@/components/chat/ChatThread';
import QuoteDetail from '@/components/quote/QuoteDetail';
import ChatErrorBoundary from '@/components/chat/ChatErrorBoundary';
import WelcomeLanding from '@/components/welcome/WelcomeLanding';

const MainPanel = () => {
  const wizardActive = useAppStore((s) => s.wizardActive);
  const activeQuoteId = useAppStore((s) => s.activeQuoteId);
  const activeSignId = useAppStore((s) => s.activeSignId);
  const chatPhase = useSignStore((s) => s.chatPhase);
  const userTier = useAppStore((s) => s.userTier);

  console.log('[MainPanel] render — wizardActive:', wizardActive, 'activeSignId:', activeSignId, 'activeQuoteId:', activeQuoteId, 'chatPhase:', chatPhase);

  // Legacy Airtable quote detail view
  if (activeQuoteId && !wizardActive && !activeSignId && chatPhase === 'welcome') {
    return <QuoteDetail quoteId={activeQuoteId} />;
  }

  // Authenticated users in welcome phase see the upload landing page, not chat
  if (chatPhase === 'welcome' && userTier === 2 && !wizardActive) {
    return <WelcomeLanding />;
  }

  // All other phases show the ChatThread (post-upload flow, sign config, etc.)
  return (
    <ChatErrorBoundary>
      <ChatThread />
    </ChatErrorBoundary>
  );
};

export default MainPanel;
