import { useAppStore } from '@/stores/appStore';
import WelcomeScreen from '@/components/chat/WelcomeScreen';
import ChatThread from '@/components/chat/ChatThread';
import QuoteDetail from '@/components/quote/QuoteDetail';

const MainPanel = () => {
  const wizardActive = useAppStore((s) => s.wizardActive);
  const activeQuoteId = useAppStore((s) => s.activeQuoteId);

  if (wizardActive) {
    return <ChatThread />;
  }

  if (activeQuoteId) {
    return <QuoteDetail quoteId={activeQuoteId} />;
  }

  return <WelcomeScreen />;
};

export default MainPanel;
