import { NavLink } from 'react-router-dom';
import { navigation } from '../data/content';

export default function Nav() {
  return (
    <div className="zine-topbar-inner">
      <div className="zine-brand-badge">
        <span className="zine-brand-text" aria-hidden="true">
          GABRIEL
        </span>
      </div>

      <nav aria-label="Navegação principal" className="zine-nav">
        {navigation.map(([to, label], index) => (
          <span key={to} className="zine-nav-item">
            {index > 0 && (
              <span className="zine-nav-slash" aria-hidden="true">
                /
              </span>
            )}
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `zine-nav-link ${isActive ? 'zine-nav-link--active' : ''}`.trim()
              }
            >
              {label}
            </NavLink>
          </span>
        ))}
      </nav>
    </div>
  );
}
