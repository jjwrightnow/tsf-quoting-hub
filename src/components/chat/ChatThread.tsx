import { useEffect, useRef, useState, useCallback } from 'react';
import { useWizardStore } from '@/stores/wizardStore';
import { useAppStore } from '@/stores/appStore';
import { useSignStore } from '@/stores/signStore';
import { getCatalogBundle, submitIntake, getQuotePortal } from '@/lib/supabase-functions';
import { checkReviewerAccess } from '@/lib/review-functions';
import { supabase } from '@/integrations/supabase/client';
import AssistantBubble from '@/components/chat/AssistantBubble';
import UserBubble from '@/components/chat/UserBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import WelcomeActions from '@/components/chat/WelcomeActions';
import PostUploadActions from '@/components/chat/PostUploadActions';
import SignIdentifier from '@/components/chat/SignIdentifier';
import SignSpecCard from '@/components/chat/SignSpecCard';
import AssistantFlagForm from '@/components/chat/AssistantFlagForm';
// Wizard steps (legacy)
import StepArtwork from '@/components/wizard/StepArtwork';
import StepProfile from '@/components/wizard/StepProfile';
import StepIllumination from '@/components/wizard/StepIllumination';
import StepMaterialFinish from '@/components/wizard/StepMaterialFinish';
import StepDimensions from '@/components/wizard/StepDimensions';
import StepProjectDetails from '@/components/wizard/StepProjectDetails';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  component?: React.ReactNode;
}

const ChatThread = () => {
  const wizard = useWizardStore();
  const appStore = useAppStore();
  const signStore = useSignStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef(crypto.randomUUID());
  const initRef = useRef(false);

  // Detect reviewer role + load autocomplete on mount
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    checkReviewerAccess()
      .then((res) => {
        if (res?.allowed) signStore.setUserRole('assistant');
      })
      .catch(() => {});

    supabase
      .from('autocomplete_options')
      .select('category, option_value, display_label, search_terms')
      .eq('active', true)
      .then(({ data }) => {
        if (data) signStore.setAutocompleteOptions(data);
      });
  }, []);

  // Determine if we're in legacy wizard mode
  const isWizardMode = appStore.wizardActive && wizard.currentStep > 0;

  // === BUILD MESSAGES ===
  useEffect(() => {
    if (isWizardMode) {
      buildWizardMessages();
    } else {
      buildSignMessages();
    }
  }, [
    isWizardMode,
    // wizard deps
    wizard.currentStep, wizard.completedSteps, wizard.artworkPath,
    wizard.profileName, wizard.illuminationName, wizard.materialName,
    wizard.finishName, wizard.letterHeight, wizard.signWidth, wizard.quantity,
    wizard.submittedQuoteId,
    // sign deps
    signStore.chatPhase, signStore.uploadedFiles, signStore.signs,
    signStore.currentSignIndex, signStore.postUploadChoice,
  ]);

  const buildSignMessages = () => {
    const msgs: Message[] = [];
    const phase = signStore.chatPhase;

    // Welcome
    msgs.push({
      id: 'welcome',
      role: 'assistant',
      content: "Welcome to Signmaker! I'm LetterMan, your sign spec assistant.",
      component: phase === 'welcome' ? <WelcomeActions /> : undefined,
    });

    // After upload or chat start
    if (phase !== 'welcome') {
      if (signStore.uploadedFiles.length > 0) {
        msgs.push({
          id: 'upload-confirm',
          role: 'user',
          content: `Uploaded ${signStore.uploadedFiles.length} file(s): ${signStore.uploadedFiles.map((f) => f.name).join(', ')}`,
        });
      }

      if (phase === 'post_upload') {
        msgs.push({
          id: 'post-upload',
          role: 'assistant',
          content: "Your artwork has been uploaded! Our team will review it and get back to you — no further action needed on your end.\n\nBut if you'd like to speed things up, you can specify sign profiles now.",
          component: <PostUploadActions />,
        });
      }

      if (signStore.postUploadChoice === 'done') {
        msgs.push({
          id: 'done-msg',
          role: 'assistant',
          content: "All set! We'll review your artwork and reach out with a quote. Come back anytime.",
        });
      }

      if (phase === 'chat' && signStore.postUploadChoice === 'questions') {
        msgs.push({
          id: 'questions-msg',
          role: 'assistant',
          content: "Of course! What questions do you have? I'm here to help.",
        });
      }

      // In chat mode without post-upload choice, just enable the input — no canned message

      // Identify signs phase
      if (phase === 'identify_signs') {
        msgs.push({
          id: 'identify',
          role: 'assistant',
          content: "How many signs are in this project? Give each a name, or reference by page number.",
          component: <SignIdentifier />,
        });
      }

      // Spec signs phase
      if (phase === 'spec_signs' || phase === 'done') {
        if (signStore.signs.length > 0) {
          const signNames = signStore.signs.map((s) => s.sign_name).join(', ');
          msgs.push({
            id: 'signs-confirmed',
            role: 'assistant',
            content: `Got it! I see ${signStore.signs.length} sign(s): ${signNames}. Let's start with ${signStore.signs[0]?.sign_name}.`,
          });
        }

        // Render sign cards
        signStore.signs.forEach((sign, i) => {
          if (phase === 'done' || i < signStore.currentSignIndex) {
            // Collapsed cards for completed signs
            msgs.push({
              id: `sign-${sign.id}`,
              role: 'assistant',
              content: '',
              component: (
                <SignSpecCard
                  key={sign.id}
                  sign={sign}
                  onSaved={() => {}}
                  onAddAnother={() => {}}
                  onDone={() => {}}
                />
              ),
            });

            if (i < signStore.currentSignIndex - 1 || (i < signStore.signs.length - 1 && phase !== 'done')) {
              msgs.push({
                id: `sign-saved-${sign.id}`,
                role: 'assistant',
                content: `${sign.sign_name} saved! Next up: ${signStore.signs[i + 1]?.sign_name || 'done'}.`,
              });
            }
          } else if (i === signStore.currentSignIndex && phase === 'spec_signs') {
            // Active card
            msgs.push({
              id: `sign-active-${sign.id}`,
              role: 'assistant',
              content: '',
              component: (
                <>
                  <SignSpecCard
                    key={sign.id}
                    sign={sign}
                    onSaved={handleSignSaved}
                    onAddAnother={handleAddAnother}
                    onDone={handleAllDone}
                  />
                  {signStore.userRole === 'assistant' && (
                    <AssistantFlagForm signPageRef={sign.page_ref || sign.sign_name} />
                  )}
                </>
              ),
            });
          }
        });
      }

      if (phase === 'done' && signStore.postUploadChoice !== 'done') {
        msgs.push({
          id: 'all-done',
          role: 'assistant',
          content: "All set! Our team will review everything and reach out with a quote. Come back anytime.",
        });
      }
    }

    setMessages(msgs);
  };

  const handleSignSaved = () => {
    const nextIndex = signStore.currentSignIndex + 1;
    if (nextIndex < signStore.signs.length) {
      signStore.setCurrentSignIndex(nextIndex);
    } else {
      signStore.setChatPhase('done');
      if (signStore.sessionId) {
        supabase
          .from('review_sessions')
          .update({ status: 'submitted' })
          .eq('id', signStore.sessionId);
      }
    }
  };

  const handleAddAnother = () => {
    signStore.setChatPhase('identify_signs');
  };

  const handleAllDone = async () => {
    if (signStore.sessionId) {
      await supabase
        .from('review_sessions')
        .update({ status: 'submitted' })
        .eq('id', signStore.sessionId);
    }
    signStore.setChatPhase('done');
  };

  // === LEGACY WIZARD MESSAGES ===
  const buildWizardMessages = () => {
    const msgs: Message[] = [];

    if (wizard.currentStep >= 1) {
      msgs.push({
        id: 'a1', role: 'assistant',
        content: "Welcome! Let's get started on your quote. Upload your artwork using the + button below, or skip and describe your project.",
        component: wizard.completedSteps.includes(1) ? undefined : <StepArtwork />,
      });
      if (wizard.completedSteps.includes(1)) {
        msgs.push({ id: 'u1', role: 'user', content: wizard.artworkPath ? `Uploaded: ${wizard.artworkPath.split('/').pop()}` : 'No artwork yet.' });
      }
    }
    if (wizard.currentStep >= 2) {
      msgs.push({ id: 'a2', role: 'assistant', content: 'What type of sign are you looking for?', component: wizard.completedSteps.includes(2) ? undefined : <StepProfile /> });
      if (wizard.completedSteps.includes(2)) msgs.push({ id: 'u2', role: 'user', content: wizard.profileName || 'Selected' });
    }
    if (wizard.currentStep >= 3) {
      msgs.push({ id: 'a3', role: 'assistant', content: 'How would you like it lit?', component: wizard.completedSteps.includes(3) ? undefined : <StepIllumination /> });
      if (wizard.completedSteps.includes(3)) msgs.push({ id: 'u3', role: 'user', content: wizard.illuminationName || 'Selected' });
    }
    if (wizard.currentStep >= 4) {
      msgs.push({ id: 'a4', role: 'assistant', content: 'What material and finish?', component: wizard.completedSteps.includes(4) ? undefined : <StepMaterialFinish /> });
      if (wizard.completedSteps.includes(4)) msgs.push({ id: 'u4', role: 'user', content: `${wizard.materialName || ''} / ${wizard.finishName || ''}`.trim() });
    }
    if (wizard.currentStep >= 5) {
      msgs.push({ id: 'a5', role: 'assistant', content: 'Almost there -- what are the dimensions?', component: wizard.completedSteps.includes(5) ? undefined : <StepDimensions /> });
      if (wizard.completedSteps.includes(5)) msgs.push({ id: 'u5', role: 'user', content: `Height: ${wizard.letterHeight}", Width: ${wizard.signWidth || 'N/A'}", Qty: ${wizard.quantity}` });
    }
    if (wizard.currentStep >= 6) {
      msgs.push({ id: 'a6', role: 'assistant', content: 'Last step -- give your project a name and location.', component: wizard.completedSteps.includes(6) ? undefined : <StepProjectDetails /> });
    }
    if (wizard.submittedQuoteId) {
      msgs.push({ id: 'a-done', role: 'assistant', content: 'Your quote has been submitted. Our team will review and respond within 1-2 business days.' });
    }

    setMessages(msgs);
  };

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, submitting]);

  // Legacy wizard submit
  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    const key = crypto.randomUUID();
    idempotencyKeyRef.current = key;

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
        artworkPath: wizard.artworkPath, profileId: wizard.profileId, profileName: wizard.profileName,
        illuminationId: wizard.illuminationId, illuminationName: wizard.illuminationName,
        materialId: wizard.materialId, materialName: wizard.materialName,
        finishId: wizard.finishId, finishName: wizard.finishName,
        letterHeight: wizard.letterHeight, signWidth: wizard.signWidth, quantity: wizard.quantity,
        projectName: wizard.projectName, location: wizard.location,
        accountType: wizard.accountType, idempotencyKey: key,
      });

      const quoteId = data?.quoteId || key;
      appStore.replaceGhostQuote({
        quoteId, projectName: wizard.projectName, status: 'Intake Submitted',
        quoteDisplayId: data?.quoteDisplayId || null, updatedAt: new Date().toISOString(),
      });
      wizard.setSubmittedQuoteId(quoteId);
      localStorage.removeItem('tsf-wizard-draft');

      try {
        const listData = await getQuotePortal({ action: 'list' });
        if (listData?.quotes) {
          appStore.setQuotesList(listData.quotes.map((q: Record<string, string>) => ({
            quoteId: q.id, projectName: q.project_name, status: q.status,
            quoteDisplayId: q.quote_display_id, updatedAt: q.updated_at || q.created_at,
          })));
        }
      } catch (reconcileErr) { console.error('[ChatThread] reconcile error:', reconcileErr); }
    } catch (err: unknown) {
      appStore.removeGhostQuote();
      const msg = err instanceof Error ? err.message : 'Submission failed';
      if (msg.includes('23505')) {
        wizard.setSubmittedQuoteId(idempotencyKeyRef.current);
      } else {
        setSubmitError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }, [wizard, appStore]);

  // Initialize wizard step if in wizard mode
  useEffect(() => {
    if (isWizardMode && wizard.currentStep === 0) {
      wizard.setCurrentStep(1);
    }
  }, [isWizardMode]);

  // Fetch catalog for wizard mode
  useEffect(() => {
    if (isWizardMode && !appStore.catalogBundle) {
      getCatalogBundle()
        .then((data) => { if (data) appStore.setCatalogBundle(data); })
        .catch(() => {});
    }
  }, [isWizardMode]);

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
            <button onClick={handleSubmit} className="rounded-lg px-4 py-2 text-sm font-medium gradient-pink-blue text-foreground">Retry</button>
          </div>
        )}

        {isWizardMode && wizard.completedSteps.includes(6) && !wizard.submittedQuoteId && !submitting && (
          <div className="mt-4">
            <button onClick={handleSubmit} className="w-full rounded-lg py-3 text-sm font-semibold gradient-pink-blue text-foreground transition-all duration-300 hover:opacity-90">
              Send Quote Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatThread;
