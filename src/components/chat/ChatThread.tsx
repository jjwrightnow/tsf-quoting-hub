import { useEffect, useRef, useState, useCallback } from 'react';
import { useWizardStore } from '@/stores/wizardStore';
import { useAppStore } from '@/stores/appStore';
import { getCatalogBundle, submitIntake, getQuotePortal } from '@/lib/supabase-functions';
import AssistantBubble from '@/components/chat/AssistantBubble';
import UserBubble from '@/components/chat/UserBubble';
import StepArtwork from '@/components/wizard/StepArtwork';
import StepProfile from '@/components/wizard/StepProfile';
import StepIllumination from '@/components/wizard/StepIllumination';
import StepMaterialFinish from '@/components/wizard/StepMaterialFinish';
import StepDimensions from '@/components/wizard/StepDimensions';
import StepProjectDetails from '@/components/wizard/StepProjectDetails';
import TypingIndicator from '@/components/chat/TypingIndicator';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  component?: React.ReactNode;
}

const ChatThread = () => {
  const wizard = useWizardStore();
  const appStore = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef(crypto.randomUUID());

  // Fetch catalog on mount
  useEffect(() => {
    if (!appStore.catalogBundle) {
      getCatalogBundle()
        .then((data) => {
          if (data) appStore.setCatalogBundle(data);
        })
        .catch(() => {
          // Use fallback empty data
          appStore.setCatalogBundle({
            profiles: [
              { id: '1', name: 'Channel Letters' },
              { id: '2', name: 'Dimensional Letters' },
              { id: '3', name: 'Cabinet Signs' },
              { id: '4', name: 'Monument Signs' },
            ],
            illumination: [
              { id: '1', name: 'Front Lit' },
              { id: '2', name: 'Back Lit (Halo)' },
              { id: '3', name: 'Front & Back Lit' },
              { id: '4', name: 'Non-Illuminated' },
            ],
            materials: [
              { id: '1', name: 'Aluminum' },
              { id: '2', name: 'Acrylic' },
              { id: '3', name: 'Stainless Steel' },
              { id: '4', name: 'Painted Metal' },
            ],
            finishes: [
              { id: '1', name: 'Brushed' },
              { id: '2', name: 'Polished' },
              { id: '3', name: 'Painted' },
              { id: '4', name: 'Raw/Natural' },
            ],
          });
        });
    }
  }, []);

  // Initialize first step if needed
  useEffect(() => {
    if (wizard.currentStep === 0) {
      wizard.setCurrentStep(1);
    }
  }, []);

  // Build messages based on wizard state
  useEffect(() => {
    const msgs: Message[] = [];

    // Step 1: Artwork
    if (wizard.currentStep >= 1) {
      msgs.push({
        id: 'a1',
        role: 'assistant',
        content: "Welcome! Let's get started on your quote. Upload your artwork using the + button below, or skip and describe your project.",
        component: wizard.completedSteps.includes(1) ? undefined : <StepArtwork />,
      });
      if (wizard.completedSteps.includes(1)) {
        msgs.push({
          id: 'u1',
          role: 'user',
          content: wizard.artworkPath ? `Uploaded: ${wizard.artworkPath.split('/').pop()}` : 'No artwork yet.',
        });
      }
    }

    // Step 2: Profile
    if (wizard.currentStep >= 2) {
      msgs.push({
        id: 'a2',
        role: 'assistant',
        content: 'What type of sign are you looking for?',
        component: wizard.completedSteps.includes(2) ? undefined : <StepProfile />,
      });
      if (wizard.completedSteps.includes(2)) {
        msgs.push({ id: 'u2', role: 'user', content: wizard.profileName || 'Selected' });
      }
    }

    // Step 3: Illumination
    if (wizard.currentStep >= 3) {
      msgs.push({
        id: 'a3',
        role: 'assistant',
        content: 'How would you like it lit?',
        component: wizard.completedSteps.includes(3) ? undefined : <StepIllumination />,
      });
      if (wizard.completedSteps.includes(3)) {
        msgs.push({ id: 'u3', role: 'user', content: wizard.illuminationName || 'Selected' });
      }
    }

    // Step 4: Material + Finish
    if (wizard.currentStep >= 4) {
      msgs.push({
        id: 'a4',
        role: 'assistant',
        content: 'What material and finish?',
        component: wizard.completedSteps.includes(4) ? undefined : <StepMaterialFinish />,
      });
      if (wizard.completedSteps.includes(4)) {
        msgs.push({
          id: 'u4',
          role: 'user',
          content: `${wizard.materialName || ''} / ${wizard.finishName || ''}`.trim(),
        });
      }
    }

    // Step 5: Dimensions
    if (wizard.currentStep >= 5) {
      msgs.push({
        id: 'a5',
        role: 'assistant',
        content: 'Almost there -- what are the dimensions?',
        component: wizard.completedSteps.includes(5) ? undefined : <StepDimensions />,
      });
      if (wizard.completedSteps.includes(5)) {
        msgs.push({
          id: 'u5',
          role: 'user',
          content: `Height: ${wizard.letterHeight}", Width: ${wizard.signWidth || 'N/A'}", Qty: ${wizard.quantity}`,
        });
      }
    }

    // Step 6: Project Details
    if (wizard.currentStep >= 6) {
      msgs.push({
        id: 'a6',
        role: 'assistant',
        content: 'Last step -- give your project a name and location.',
        component: wizard.completedSteps.includes(6) ? undefined : <StepProjectDetails />,
      });
    }

    // Submitted
    if (wizard.submittedQuoteId) {
      msgs.push({
        id: 'a-done',
        role: 'assistant',
        content: `Your quote has been submitted. Our team will review and respond within 1-2 business days.`,
      });
    }

    setMessages(msgs);
  }, [
    wizard.currentStep,
    wizard.completedSteps,
    wizard.artworkPath,
    wizard.profileName,
    wizard.illuminationName,
    wizard.materialName,
    wizard.finishName,
    wizard.letterHeight,
    wizard.signWidth,
    wizard.quantity,
    wizard.submittedQuoteId,
  ]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, submitting]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    const key = crypto.randomUUID();
    idempotencyKeyRef.current = key;

    // Ghost sidebar item
    const ghost = {
      quoteId: 'pending-' + key,
      projectName: wizard.projectName,
      status: 'Intake Submitted',
      quoteDisplayId: null,
      updatedAt: new Date().toISOString(),
      isPending: true,
    };
    appStore.addGhostQuote(ghost);

    try {
      const data = await submitIntake({
        artworkPath: wizard.artworkPath,
        profileId: wizard.profileId,
        profileName: wizard.profileName,
        illuminationId: wizard.illuminationId,
        illuminationName: wizard.illuminationName,
        materialId: wizard.materialId,
        materialName: wizard.materialName,
        finishId: wizard.finishId,
        finishName: wizard.finishName,
        letterHeight: wizard.letterHeight,
        signWidth: wizard.signWidth,
        quantity: wizard.quantity,
        projectName: wizard.projectName,
        location: wizard.location,
        accountType: wizard.accountType,
        idempotencyKey: key,
      });

      const quoteId = data?.quoteId || key;
      appStore.replaceGhostQuote({
        quoteId,
        projectName: wizard.projectName,
        status: 'Intake Submitted',
        quoteDisplayId: data?.quoteDisplayId || null,
        updatedAt: new Date().toISOString(),
      });
      wizard.setSubmittedQuoteId(quoteId);
      localStorage.removeItem('tsf-wizard-draft');

      // Reconcile
      try {
        const listData = await getQuotePortal({ action: 'list' });
        if (listData?.quotes) {
          appStore.setQuotesList(
            listData.quotes.map((q: Record<string, string>) => ({
              quoteId: q.id,
              projectName: q.project_name,
              status: q.status,
              quoteDisplayId: q.quote_display_id,
              updatedAt: q.updated_at || q.created_at,
            }))
          );
        }
      } catch {}
    } catch (err: unknown) {
      appStore.removeGhostQuote();
      const msg = err instanceof Error ? err.message : 'Submission failed';
      if (msg.includes('23505')) {
        // Duplicate — silently resolve
        wizard.setSubmittedQuoteId(idempotencyKeyRef.current);
      } else {
        setSubmitError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }, [wizard, appStore]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
      <div className="mx-auto max-w-2xl space-y-1">
        {messages.map((msg) => (
          <div key={msg.id} className="animate-fade-in-up">
            {msg.role === 'assistant' ? (
              <AssistantBubble content={msg.content}>
                {msg.component}
              </AssistantBubble>
            ) : (
              <UserBubble content={msg.content} />
            )}
          </div>
        ))}

        {submitting && <TypingIndicator />}

        {submitError && (
          <div className="mt-4 rounded-lg border border-accent bg-card p-4 text-center">
            <p className="text-sm text-accent mb-3">{submitError}</p>
            <button
              onClick={handleSubmit}
              className="rounded-lg px-4 py-2 text-sm font-medium gradient-pink-blue text-foreground"
            >
              Retry
            </button>
          </div>
        )}

        {/* Submit trigger for step 6 */}
        {wizard.completedSteps.includes(6) && !wizard.submittedQuoteId && !submitting && (
          <div className="mt-4">
            <button
              onClick={handleSubmit}
              className="w-full rounded-lg py-3 text-sm font-semibold gradient-pink-blue text-foreground transition-all duration-300 hover:opacity-90"
            >
              Send Quote Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatThread;
