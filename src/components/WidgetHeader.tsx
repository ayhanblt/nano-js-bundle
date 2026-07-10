import React from 'react';
import Icon from './Icon';
import { t } from '../i18n';

interface WidgetHeaderProps {
  onClose: () => void;
  onExpand?: () => void;
}

const WidgetHeader: React.FC<WidgetHeaderProps> = ({ onClose, onExpand }) => {
  return (
    <div className="bg-surface-container-low px-md py-sm border-b border-outline-variant flex items-center justify-between">
      <div className="flex items-center gap-sm">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white">
          <Icon name="main_logo" className="w-6 h-6 fill-white" />
        </div>
        <div>
          <div className="flex items-center gap-xs">
            <span className="font-label-lg text-label-lg font-semibold text-on-surface">{t('ai.assistant')}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-xs">
        {onExpand && (
          <button onClick={onExpand} className="text-on-surface-variant hover:bg-surface-container-high p-1 rounded-md transition-colors cursor-pointer">
            <Icon name="expand_more" className="w-5 h-5 fill-current" />
          </button>
        )}
        <button onClick={onClose} className="text-on-surface-variant hover:bg-surface-container-high p-1 rounded-md transition-colors cursor-pointer">
          <Icon name="close" className="w-5 h-5 fill-current" />
        </button>
      </div>
    </div>
  );
};

export default WidgetHeader;
