import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import type { StatusResponse } from '../types';
import Header from '../components/Header';
import GroupColumn from '../components/GroupColumn';

function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const intervalRef = useRef(60);

  const load = useCallback(async () => {
    try {
      const res = await api.getStatus();
      setData(res);
      setError(false);
      intervalRef.current = res.intervalSeconds;
      setCountdown(res.intervalSeconds);
    } catch {
      setError(true);
      setCountdown(intervalRef.current);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          load();
          return intervalRef.current;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [load]);

  const zh = i18n.language === 'zh';
  const title = data ? (zh ? data.siteTitleZh : data.siteTitleEn) : undefined;

  return (
    <div className="page">
      <Header title={title} subtitle={t('app.subtitle')} live />

      <div className="status-bar">
        <span className="muted">
          {t('app.lastUpdated')}:{' '}
          {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : '—'}
        </span>
        {data && data.summary.down > 0 ? (
          <span className="banner banner-danger">
            {t('app.failedBanner', { count: data.summary.down })}
          </span>
        ) : data && data.summary.total > 0 ? (
          <span className="banner banner-ok">{t('app.allHealthy')}</span>
        ) : null}
        <span className="chip chip-refresh">
          {t('app.autoRefresh')} {formatCountdown(countdown)}
        </span>
      </div>

      {error && <div className="banner banner-danger center">{t('app.loadError')}</div>}
      {!data && !error && <div className="page-loading">{t('app.loading')}</div>}

      {data && (
        <div className="groups-grid">
          {data.groups.map((group) => (
            <GroupColumn key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
