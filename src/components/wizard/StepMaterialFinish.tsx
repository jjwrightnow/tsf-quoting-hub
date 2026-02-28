import { useState } from 'react';
import { useWizardStore } from '@/stores/wizardStore';
import { useAppStore } from '@/stores/appStore';
import CatalogCard from '@/components/wizard/CatalogCard';

const StepMaterialFinish = () => {
  const { setMaterial, setFinish, completeStep, setCurrentStep, materialId, finishId } = useWizardStore();
  const catalog = useAppStore((s) => s.catalogBundle);
  const [localMaterial, setLocalMaterial] = useState<{ id: string; name: string } | null>(
    materialId ? { id: materialId, name: '' } : null
  );

  const materials = catalog?.materials || [];
  const finishes = catalog?.finishes || [];

  const handleMaterial = (id: string, name: string) => {
    setLocalMaterial({ id, name });
    setMaterial(id, name);
  };

  const handleFinish = (id: string, name: string) => {
    setFinish(id, name);
    completeStep(4);
    setCurrentStep(5);
  };

  return (
    <div className="space-y-4 py-2">
      <div>
        <p className="text-xs text-muted-foreground mb-2">Material</p>
        <div className="flex gap-3 overflow-x-auto scrollbar-none">
          {materials.map((item) => (
            <CatalogCard
              key={item.id}
              label={item.name}
              selected={materialId === item.id}
              onClick={() => handleMaterial(item.id, item.name)}
            />
          ))}
        </div>
      </div>
      {localMaterial && (
        <div className="animate-fade-in-up">
          <p className="text-xs text-muted-foreground mb-2">Finish</p>
          <div className="flex gap-3 overflow-x-auto scrollbar-none">
            {finishes.map((item) => (
              <CatalogCard
                key={item.id}
                label={item.name}
                selected={finishId === item.id}
                onClick={() => handleFinish(item.id, item.name)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StepMaterialFinish;
