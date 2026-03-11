import { useEffect, useRef, useState, useCallback } from 'react';
import { useWizardStore } from '@/stores/wizardStore';
import { useAppStore } from '@/stores/appStore';
import { useSignStore, type SignRecord } from '@/stores/signStore';
import { getCatalogBundle, submitIntake, getQuotePortal } from '@/lib/supabase-functions';
import { checkReviewerAccess } from '@/lib/review-functions';
import { supabase } from '@/integrations/supabase/client';
import { PROFILE_DEFAULTS } from '@/lib/sign-constants';
import AssistantBubble from '@/components/chat/AssistantBubble';
import UserBubble from '@/components/chat/UserBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import WelcomeActions from '@/components/chat/WelcomeActions';
import PostUploadActions from '@/components/chat/PostUploadActions';
import SignNameInput from '@/components/chat/SignNameInput';
import ProfileSelector from '@/components/chat/ProfileSelector';
import SignSpecCard from '@/components/chat/SignSpecCard';
import AssistantFlagForm from '@/components/chat/AssistantFlagForm';
import BatchAssignGrid from '@/components/chat/BatchAssignGrid';
import OneDonePicker from '@/components/chat/OneDonePicker';
import OneDoneReview from '@/components/chat/OneDoneReview';
import AccessRequestForm from '@/components/chat/AccessRequestForm';
import VerifyEmailForm from '@/components/chat/VerifyEmailForm';
import GuestUpload from '@/components/chat/GuestUpload';
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
    signStore.pendingSignName, signStore.uploadPath, signStore.cannedHistory,
    appStore.userTier, appStore.operatorConfig,
  ]);

  const buildSignMessages = () => {
    const msgs: Message[] = [];
    const phase = signStore.chatPhase;

    // Welcome
    const chatbotName = appStore.operatorConfig?.chatbot_name || 'your assistant';
    const userTier = appStore.userTier;

    let welcomeComponent: React.ReactNode | undefined;
    if (phase === 'welcome') {
      if (userTier === 0) {
        welcomeComponent = (
          <div className="mt-3 flex flex-col gap-2">
            <button
              onClick={() => signStore.setChatPhase('access_request')}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
            >
              Request Access
            </button>
            <button
              onClick={() => signStore.setChatPhase('verify_email')}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
            >
              I'm Already a Customer
            </button>
          </div>
        );
      } else if (userTier === 1) {
        welcomeComponent = <GuestUpload />;
      } else {
        welcomeComponent = <WelcomeActions />;
      }
    }

    msgs.push({
      id: 'welcome',
      role: 'assistant',
      content: `Welcome! I'm ${chatbotName}, here to help with your sign project.`,
      component: welcomeComponent,
    });

    // Canned Q&A history
    signStore.cannedHistory.forEach((entry, i) => {
      msgs.push({ id: `canned-q-${i}`, role: 'user', content: entry.q });
      msgs.push({ id: `canned-a-${i}`, role: 'assistant', content: entry.a });
    });

    if (phase === 'welcome') { setMessages(msgs); return; }

    // Access request flow
    if (phase === 'access_request') {
      msgs.push({
        id: 'access-request',
        role: 'assistant',
        content: "We'd love to have you! Fill out the form below to request access.",
        component: <AccessRequestForm onSubmitted={() => signStore.setChatPhase('access_submitted')} />,
      });
      setMessages(msgs); return;
    }

    if (phase === 'verify_email') {
      msgs.push({
        id: 'verify-email',
        role: 'assistant',
        content: 'Enter the email address associated with your account.',
        component: <VerifyEmailForm />,
      });
      setMessages(msgs); return;
    }

    if (phase === 'access_submitted') {
      msgs.push({
        id: 'access-submitted',
        role: 'assistant',
        content: "Your request has been submitted! You'll receive an email once your access is approved.",
      });
      setMessages(msgs); return;
    }

    // Upload confirmation
    if (signStore.uploadedFiles.length > 0) {
      msgs.push({
        id: 'upload-confirm',
        role: 'user',
        content: `Uploaded ${signStore.uploadedFiles.length} file(s): ${signStore.uploadedFiles.map((f) => f.name).join(', ')}`,
      });
    }

    // Post-upload choices
    if (phase === 'post_upload') {
      msgs.push({
        id: 'post-upload',
        role: 'assistant',
        content: "Your artwork has been uploaded! Our team will review it and get back to you — no further action needed.\n\nBut if you'd like to speed things up, you can specify sign profiles now.",
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

    // === New upload-path phases ===
    if (signStore.uploadPath === 'dump_run' && phase === 'done') {
      msgs.push({
        id: 'dump-run-done',
        role: 'assistant',
        content: "All set! We've got your files. Our team will review everything and reach out with a quote. No action needed on your end.",
      });
    }

    if (phase === 'batch_assign') {
      msgs.push({
        id: 'batch-assign',
        role: 'assistant',
        content: 'Assign a profile to each file below.',
        component: <BatchAssignGrid onDone={() => signStore.setChatPhase('done')} />,
      });
    }

    if (phase === 'one_done_pick') {
      msgs.push({
        id: 'one-done-pick',
        role: 'assistant',
        content: 'Pick the profile that applies to all your signs.',
        component: <OneDonePicker />,
      });
    }

    if (phase === 'one_done_specs') {
      msgs.push({
        id: 'one-done-review',
        role: 'assistant',
        content: '',
        component: <OneDoneReview />,
      });
    }

    // === Completed signs (collapsed cards) ===
    signStore.signs.forEach((sign, i) => {
      // User said the sign name
      msgs.push({
        id: `sign-name-${sign.id}`,
        role: 'user',
        content: sign.sign_name,
      });

      // Profile chosen confirmation
      if (sign.profile_type) {
        msgs.push({
          id: `sign-profile-${sign.id}`,
          role: 'user',
          content: sign.profile_type,
        });
      }

      // If this sign is fully saved (collapsed)
      if (sign.status === 'saved') {
        msgs.push({
          id: `sign-card-${sign.id}`,
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
      }
    });

    // === Active sign: spec editing ===
    if (phase === 'spec_signs') {
      const activeSign = signStore.signs[signStore.currentSignIndex];
      if (activeSign && activeSign.status !== 'saved') {
        msgs.push({
          id: `sign-active-${activeSign.id}`,
          role: 'assistant',
          content: '',
          component: (
            <>
              <SignSpecCard
                key={activeSign.id}
                sign={activeSign}
                onSaved={handleSignSaved}
                onAddAnother={handleAddAnother}
                onDone={handleAllDone}
              />
              {signStore.userRole === 'assistant' && (
                <AssistantFlagForm signPageRef={activeSign.page_ref || activeSign.sign_name} />
              )}
            </>
          ),
        });
      }
    }

    // === Identify sign (name input) ===
    if (phase === 'identify_signs') {
      const isFirst = signStore.signs.length === 0;
      msgs.push({
        id: 'identify',
        role: 'assistant',
        content: isFirst
          ? "Which sign are you working on? Enter a name or page number."
          : "Next sign — enter a name or page number.",
        component: (
          <div className="space-y-3">
            <SignNameInput
              isFirst={isFirst}
              onSubmit={handleSignNameSubmit}
            />
            {!isFirst && (
              <button
                onClick={handleAllDone}
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:border-primary"
              >
                I'm done adding signs
              </button>
            )}
          </div>
        ),
      });
    }

    // === Pick profile ===
    if (phase === 'pick_profile' && signStore.pendingSignName) {
      msgs.push({
        id: 'pick-profile-name',
        role: 'user',
        content: signStore.pendingSignName,
      });
      msgs.push({
        id: 'pick-profile',
        role: 'assistant',
        content: `What type of sign is "${signStore.pendingSignName}"?`,
        component: (
          <ProfileSelector
            signName={signStore.pendingSignName}
            onSelect={handleProfileSelect}
          />
        ),
      });
    }

    // === Done ===
    if (phase === 'done' && signStore.postUploadChoice !== 'done') {
      msgs.push({
        id: 'all-done',
        role: 'assistant',
        content: "All set! Our team will review everything and reach out with a quote. Come back anytime.",
      });
    }

    setMessages(msgs);
  };

  // === New flow handlers ===
  const handleSignNameSubmit = (name: string) => {
    signStore.setPendingSignName(name);
    signStore.setChatPhase('pick_profile');
  };

  const handleProfileSelect = async (profile: string) => {
    const name = signStore.pendingSignName;
    if (!name || !signStore.sessionId) return;

    // Create the sign record in DB
    const defaults = PROFILE_DEFAULTS[profile] || {};
    const insert = {
      session_id: signStore.sessionId,
      sign_name: name,
      sort_order: signStore.signs.length,
      status: 'draft',
      specs_source: 'draft',
      profile_type: profile,
      ...defaults,
    };

    const { data, error } = await supabase
      .from('review_signs')
      .insert(insert)
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating sign:', error);
      return;
    }

    const newSign: SignRecord = {
      id: data.id,
      session_id: data.session_id,
      sign_name: data.sign_name,
      page_ref: data.page_ref,
      sort_order: data.sort_order,
      profile_type: data.profile_type,
      metal_type: data.metal_type,
      finish: data.finish,
      depth: data.depth,
      led_color: data.led_color,
      mounting: data.mounting,
      back_type: data.back_type,
      acrylic_face: data.acrylic_face,
      lead_wires: data.lead_wires,
      ul_label: data.ul_label,
      wire_exit: data.wire_exit,
      specs_source: data.specs_source,
      status: data.status,
      price: data.price,
      customer_notes: data.customer_notes,
      flag_count: data.flag_count,
    };

    signStore.addSign(newSign);
    signStore.setCurrentSignIndex(signStore.signs.length); // points to newly added
    signStore.setPendingSignName(null);
    signStore.setChatPhase('spec_signs');
  };

  const handleSignSaved = () => {
    // After saving, go back to identify next sign
    signStore.setChatPhase('identify_signs');
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
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8 flex flex-col">
      <div className="flex-1" />
      <div className="mx-auto max-w-2xl space-y-5">
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
