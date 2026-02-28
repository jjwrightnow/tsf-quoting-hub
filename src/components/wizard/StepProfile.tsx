import { useWizardStore } from '@/stores/wizardStore';
import { useAppStore } from '@/stores/appStore';
import CatalogCard from '@/components/wizard/CatalogCard';

const StepProfile = () => {
  const { setProfile, completeStep, setCurrentStep, profileId } = useWizardStore();
  const catalog = useAppStore((s) => s.catalogBundle);

  const items = catalog?.profiles || [];

  const handleSelect = (id: string, name: string) => {
    setProfile(id, name);
    completeStep(2);
    setCurrentStep(3);
  };

  return (
    <div className="flex gap-3 overflow-x-auto py-2 scrollbar-none">
      {items.map((item) => (
        <CatalogCard
          key={item.id}
          label={item.name}
          selected={profileId === item.id}
          onClick={() => handleSelect(item.id, item.name)}
        />
      ))}
    </div>
  );
};

export default StepProfile;
