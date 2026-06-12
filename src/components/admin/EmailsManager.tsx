import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import type { AlertEmail } from '../../types';

export default function EmailsManager() {
  const { t } = useTranslation();
  const [emails, setEmails] = useState<AlertEmail[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const load = useCallback(async () => {
    try {
      setEmails(await api.getAlertEmails());
    } catch {
      setIsError(true);
      setMessage(t('admin.error'));
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.createAlertEmail(newEmail);
      setNewEmail('');
      await load();
    } catch {
      setIsError(true);
      setMessage(t('admin.error'));
    }
  };

  const onToggle = async (row: AlertEmail) => {
    await api.updateAlertEmail(row.id, { isActive: !row.isActive }).catch(() => {
      setIsError(true);
      setMessage(t('admin.error'));
    });
    await load();
  };

  const onDelete = async (id: number) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    await api.deleteAlertEmail(id).catch(() => {
      setIsError(true);
      setMessage(t('admin.error'));
    });
    await load();
  };

  const onTest = async () => {
    setMessage('');
    try {
      const { sent } = await api.sendTestEmail();
      setIsError(!sent);
      setMessage(sent ? t('admin.emails.testSent') : t('admin.emails.testFailed'));
    } catch {
      setIsError(true);
      setMessage(t('admin.emails.testFailed'));
    }
  };

  return (
    <div className="admin-section">
      {message && (
        <div className={`banner ${isError ? 'banner-danger' : 'banner-ok'}`}>{message}</div>
      )}

      <form className="card form-row" onSubmit={onAdd}>
        <h3>{t('admin.emails.addTitle')}</h3>
        <div className="form-grid">
          <label>
            {t('admin.emails.email')}
            <input
              type="email"
              required
              placeholder="alerts@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">{t('admin.add')}</button>
            <button className="btn btn-light" type="button" onClick={onTest}>
              {t('admin.emails.sendTest')}
            </button>
          </div>
        </div>
      </form>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('admin.emails.email')}</th>
              <th>{t('admin.emails.active')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {emails.map((row) => (
              <tr key={row.id}>
                <td>{row.email}</td>
                <td>
                  <input type="checkbox" checked={row.isActive} onChange={() => onToggle(row)} />
                </td>
                <td className="cell-actions">
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(row.id)}>
                    {t('admin.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
