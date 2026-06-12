import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import type { Group, LinkItem } from '../../types';

export default function LinksManager() {
  const { t, i18n } = useTranslation();
  const zh = i18n.language === 'zh';
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', url: '', groupId: 0 });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [linksData, groupsData] = await Promise.all([api.getLinks(), api.getGroups()]);
      setLinks(linksData);
      setGroups(groupsData);
      setForm((f) => ({ ...f, groupId: f.groupId || groupsData[0]?.id || 0 }));
      setError('');
    } catch {
      setError(t('admin.error'));
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const groupName = (g?: Group) => (g ? (zh ? g.nameZh : g.nameEn) : '');

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.createLink({ name: form.name || null, url: form.url, groupId: form.groupId });
      setForm((f) => ({ ...f, name: '', url: '' }));
      await load();
    } catch {
      setError(t('admin.error'));
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    await api.deleteLink(id).catch(() => setError(t('admin.error')));
    await load();
  };

  const onToggleActive = async (link: LinkItem) => {
    await api.updateLink(link.id, { isActive: !link.isActive }).catch(() => setError(t('admin.error')));
    await load();
  };

  const onCheck = async (id: number) => {
    setBusy(true);
    await api.checkLink(id).catch(() => setError(t('admin.error')));
    await load();
    setBusy(false);
  };

  const onCheckAll = async () => {
    setBusy(true);
    await api.checkAll().catch(() => setError(t('admin.error')));
    await load();
    setBusy(false);
  };

  return (
    <div className="admin-section">
      {error && <div className="banner banner-danger">{error}</div>}

      <form className="card form-row" onSubmit={onAdd}>
        <h3>{t('admin.links.addTitle')}</h3>
        <div className="form-grid">
          <label>
            {t('admin.links.name')}
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            {t('admin.links.url')}
            <input
              type="url"
              required
              placeholder="https://…"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </label>
          <label>
            {t('admin.links.group')}
            <select
              value={form.groupId}
              onChange={(e) => setForm({ ...form, groupId: Number(e.target.value) })}
            >
              {groups.map((g) => <option key={g.id} value={g.id}>{groupName(g)}</option>)}
            </select>
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy || !form.url}>
            {t('admin.add')}
          </button>
        </div>
      </form>

      <div className="card">
        <div className="table-head-actions">
          <button className="btn btn-light" onClick={onCheckAll} disabled={busy}>
            {t('admin.links.checkAll')}
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('admin.links.status')}</th>
                <th>{t('admin.links.name')}</th>
                <th>{t('admin.links.url')}</th>
                <th>{t('admin.links.group')}</th>
                <th>{t('admin.links.responseTime')}</th>
                <th>{t('admin.links.lastChecked')}</th>
                <th>{t('admin.links.active')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className={link.isActive ? '' : 'row-disabled'}>
                  <td>
                    <span
                      className={`dot ${link.lastStatus === 'up' ? 'dot-up' : link.lastStatus === 'down' ? 'dot-down' : 'dot-pending'}`}
                      title={link.lastError || String(link.lastStatusCode || '')}
                    />
                  </td>
                  <td>{link.name || '—'}</td>
                  <td className="cell-url"><a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a></td>
                  <td>{groupName(link.group)}</td>
                  <td>{link.lastResponseTimeMs != null ? `${link.lastResponseTimeMs} ms` : '—'}</td>
                  <td>{link.lastCheckedAt ? new Date(link.lastCheckedAt).toLocaleString() : '—'}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={link.isActive}
                      onChange={() => onToggleActive(link)}
                    />
                  </td>
                  <td className="cell-actions">
                    <button className="btn btn-light btn-sm" disabled={busy} onClick={() => onCheck(link.id)}>
                      {t('admin.links.checkNow')}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(link.id)}>
                      {t('admin.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
