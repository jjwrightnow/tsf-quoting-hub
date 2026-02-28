import { useWizardStore } from '@/stores/wizardStore';
import { useAppStore } from '@/stores/appStore';
import CatalogCard from '@/components/wizard/CatalogCard';

const StepIllumination = () => {
  const { setIllumination, completeStep, setCurrentStep, illuminationId } = useWizardStore();
  const catalog = useAppStore((s) => s.catalogBundle);

  const items = catalog?.illumination || [];

  const handleSelect = (id: string, name: string) => {
    setIllumination(id, name);
    completeStep(3);
    setCurrentStep(4);
  };

  return (
    <div className="grid grid-cols-2 gap-3 py-2">
      {items.map((item) => (
        <CatalogCard
          key={item.id}
          label={item.name}
          selected={illuminationId === item.id}
          onClick={() => handleSelect(item.id, item.name)}
        />
      ))}
    </div>
  );
};

export default StepIllumination;
