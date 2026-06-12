import { useTranslation } from 'react-i18next';
import type { Group, LinkItem } from '../types';

function statusClass(status: LinkItem['lastStatus']) {
  if (status === 'up') return 'dot-up';
  if (status === 'down') return 'dot-down';
  return 'dot-pending';
}

export default function GroupColumn({ group }: { group: Group & { links: LinkItem[] } }) {
  const { t, i18n } = useTranslation();
  const zh = i18n.language === 'zh';
  const name = zh ? group.nameZh : group.nameEn;
  const description = zh ? group.descriptionZh : group.descriptionEn;

  return (
    <section className="group-card card">
      <div className="group-head">
        <h2 className="group-title">
          <span className="group-bullet" /> {name}
        </h2>
        <span className="group-count">{t('app.items', { count: group.links.length })}</span>
      </div>
      {description && <p className="group-desc">{description}</p>}
      <div className="link-list">
        {group.links.length === 0 && <p className="muted">{t('app.noLinks')}</p>}
        {group.links.map((link, index) => (
          <div className="link-card" key={link.id}>
            <span className="link-index">{index + 1}</span>
            <div className="link-body">
              {link.name && <span className="link-name">{link.name}</span>}
              <span className="link-url">{link.url}</span>
            </div>
            <div className="link-actions">
              <a
                className="link-open"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.url}
              >
                ↗
              </a>
              <span
                className={`dot ${statusClass(link.lastStatus)}`}
                title={
                  link.lastStatus === 'up'
                    ? `${t('app.statusUp')} (${link.lastStatusCode ?? ''} · ${link.lastResponseTimeMs ?? '?'}ms)`
                    : link.lastStatus === 'down'
                      ? `${t('app.statusDown')} (${link.lastError ?? ''})`
                      : t('app.statusPending')
                }
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
