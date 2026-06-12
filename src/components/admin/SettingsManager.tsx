import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';

export default function SettingsManager() {
  const { t } = useTranslation();
  const [interval, setIntervalSec] = useState('60');
  const [timeout, setTimeoutMs] = useState('10000');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [recoveryEnabled, setRecoveryEnabled] = useState(true);
  const [titleEn, setTitleEn] = useState('');
  const [titleZh, setTitleZh] = useState('');
  const [message, setMessage] = useState<'saved' | 'error' | ''>('');

  useEffect(() => {
    api.getSettings().then((s) => {
      setIntervalSec(s.check_interval_seconds);
      setTimeoutMs(s.request_timeout_ms);
      setAlertsEnabled(s.alerts_enabled === 'true');
      setRecoveryEnabled(s.recovery_alerts_enabled === 'true');
      setTitleEn(s.site_title_en);
      setTitleZh(s.site_title_zh);
    }).catch(() => setMessage('error'));
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.updateSettings({
        check_interval_seconds: interval,
        request_timeout_ms: timeout,
        alerts_enabled: String(alertsEnabled),
        recovery_alerts_enabled: String(recoveryEnabled),
        site_title_en: titleEn,
        site_title_zh: titleZh,
      });
      setMessage('saved');
    } catch {
      setMessage('error');
    }
  };

  return (
    <div className="admin-section">
      <form className="card form-row" onSubmit={onSubmit}>
        <h3>{t('admin.settings.title')}</h3>
        {message === 'saved' && <div className="banner banner-ok">{t('admin.saved')}</div>}
        {message === 'error' && <div className="banner banner-danger">{t('admin.error')}</div>}
        <div className="form-grid">
          <label>
            {t('admin.settings.interval')}
            <input
              type="number"
              min={5}
              required
              value={interval}
              onChange={(e) => setIntervalSec(e.target.value)}
            />
            <small className="muted">{t('admin.settings.intervalHelp')}</small>
          </label>
          <label>
            {t('admin.settings.timeout')}
            <input
              type="number"
              min={1000}
              required
              value={timeout}
              onChange={(e) => setTimeoutMs(e.target.value)}
            />
          </label>
          <label>
            {t('admin.settings.siteTitleEn')}
            <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
          </label>
          <label>
            {t('admin.settings.siteTitleZh')}
            <input value={titleZh} onChange={(e) => setTitleZh(e.target.value)} />
          </label>
          <label className="checkbox span-2">
            <input
              type="checkbox"
              checked={alertsEnabled}
              onChange={(e) => setAlertsEnabled(e.target.checked)}
            />
            {t('admin.settings.alertsEnabled')}
          </label>
          <label className="checkbox span-2">
            <input
              type="checkbox"
              checked={recoveryEnabled}
              onChange={(e) => setRecoveryEnabled(e.target.checked)}
            />
            {t('admin.settings.recoveryEnabled')}
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">{t('admin.save')}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
