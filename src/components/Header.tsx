import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface Props {
  title?: string;
  subtitle?: string;
  live?: boolean;
}

export default function Header({ title, subtitle, live }: Props) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="header card">
      <div className="header-left">
        <div className="logo">LD</div>
        <div>
          <h1 className="header-title">{title || t('app.title')}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="header-right">
        {live && (
          <span className="chip chip-live">
            <span className="dot dot-up" /> {t('app.liveFromApi')}
          </span>
        )}
        <div className="lang-switch">
          <button
            className={i18n.language === 'en' ? 'active' : ''}
            onClick={() => i18n.changeLanguage('en')}
          >
            EN
          </button>
          <button
            className={i18n.language === 'zh' ? 'active' : ''}
            onClick={() => i18n.changeLanguage('zh')}
          >
            中文
          </button>
        </div>
        {location.pathname.startsWith('/admin') ? (
          <Link className="btn btn-light" to="/">{t('nav.dashboard')}</Link>
        ) : user ? (
          <Link className="btn btn-primary" to="/admin">{t('nav.admin')}</Link>
        ) : (
          <Link className="btn btn-light" to="/login">{t('nav.login')}</Link>
        )}
        {user && (
          <button className="btn btn-light" onClick={logout}>{t('nav.logout')}</button>
        )}
      </div>
    </header>
  );
}
