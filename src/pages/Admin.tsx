import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import LinksManager from '../components/admin/LinksManager';
import GroupsManager from '../components/admin/GroupsManager';
import SettingsManager from '../components/admin/SettingsManager';
import EmailsManager from '../components/admin/EmailsManager';

type Tab = 'links' | 'groups' | 'settings' | 'emails';

export default function Admin() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('links');

  const tabs: Tab[] = ['links', 'groups', 'settings', 'emails'];

  return (
    <div className="page">
      <Header title={t('admin.title')} />
      <div className="tabs">
        {tabs.map((key) => (
          <button
            key={key}
            className={`tab ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            {t(`admin.tabs.${key}`)}
          </button>
        ))}
      </div>
      {tab === 'links' && <LinksManager />}
      {tab === 'groups' && <GroupsManager />}
      {tab === 'settings' && <SettingsManager />}
      {tab === 'emails' && <EmailsManager />}
    </div>
  );
}
