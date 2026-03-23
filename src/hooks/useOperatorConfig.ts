import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/stores/appStore';

export function useOperatorConfig() {
  const operatorConfig = useAppStore((s) => s.operatorConfig);
  const setOperatorConfig = useAppStore((s) => s.setOperatorConfig);

  useEffect(() => {
    if (operatorConfig) return;
    supabase
      .from('operator_config')
      .select('brand_name, chatbot_name, logo_url, primary_color, support_email, canned_questions, context_instruction')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setOperatorConfig({
            brand_name: data.brand_name,
            chatbot_name: data.chatbot_name,
            logo_url: data.logo_url,
            primary_color: data.primary_color,
            support_email: data.support_email,
            canned_questions: Array.isArray(data.canned_questions)
              ? (data.canned_questions as { q: string; a: string }[])
              : [],
            context_instruction: data.context_instruction || null,
          });
        }
      });
  }, [operatorConfig, setOperatorConfig]);

  return operatorConfig;
}
