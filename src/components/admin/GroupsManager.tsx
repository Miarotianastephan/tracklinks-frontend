import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import type { Group } from '../../types';

const EMPTY = { key: '', nameEn: '', nameZh: '', descriptionEn: '', descriptionZh: '', sortOrder: 0 };

export default function GroupsManager() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<Group[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setGroups(await api.getGroups());
      setError('');
    } catch {
      setError(t('admin.error'));
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateGroup(editingId, form);
      } else {
        await api.createGroup(form);
      }
      setForm({ ...EMPTY });
      setEditingId(null);
      await load();
    } catch {
      setError(t('admin.error'));
    }
  };

  const onEdit = (group: Group) => {
    setEditingId(group.id);
    setForm({
      key: group.key,
      nameEn: group.nameEn,
      nameZh: group.nameZh,
      descriptionEn: group.descriptionEn || '',
      descriptionZh: group.descriptionZh || '',
      sortOrder: group.sortOrder,
    });
  };

  const onDelete = async (id: number) => {
    if (!window.confirm(`${t('admin.confirmDelete')} ${t('admin.groups.deleteWarning')}`)) return;
    await api.deleteGroup(id).catch(() => setError(t('admin.error')));
    await load();
  };

  return (
    <div className="admin-section">
      {error && <div className="banner banner-danger">{error}</div>}

      <form className="card form-row" onSubmit={onSubmit}>
        <h3>{editingId ? t('admin.edit') : t('admin.groups.addTitle')}</h3>
        <div className="form-grid">
          <label>
            {t('admin.groups.key')}
            <input required value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} />
          </label>
          <label>
            {t('admin.groups.nameEn')}
            <input required value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
          </label>
          <label>
            {t('admin.groups.nameZh')}
            <input required value={form.nameZh} onChange={(e) => setForm({ ...form, nameZh: e.target.value })} />
          </label>
          <label>
            {t('admin.groups.sortOrder')}
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </label>
          <label className="span-2">
            {t('admin.groups.descEn')}
            <textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
          </label>
          <label className="span-2">
            {t('admin.groups.descZh')}
            <textarea value={form.descriptionZh} onChange={(e) => setForm({ ...form, descriptionZh: e.target.value })} />
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              {editingId ? t('admin.save') : t('admin.add')}
            </button>
            {editingId && (
              <button
                className="btn btn-light"
                type="button"
                onClick={() => { setEditingId(null); setForm({ ...EMPTY }); }}
              >
                {t('admin.cancel')}
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('admin.groups.sortOrder')}</th>
              <th>{t('admin.groups.key')}</th>
              <th>{t('admin.groups.nameEn')}</th>
              <th>{t('admin.groups.nameZh')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id}>
                <td>{group.sortOrder}</td>
                <td>{group.key}</td>
                <td>{group.nameEn}</td>
                <td>{group.nameZh}</td>
                <td className="cell-actions">
                  <button className="btn btn-light btn-sm" onClick={() => onEdit(group)}>{t('admin.edit')}</button>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(group.id)}>{t('admin.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
