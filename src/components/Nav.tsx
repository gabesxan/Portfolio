import { NavLink } from 'react-router-dom';
import { navigation } from '../data/content';
export default function Nav() {
  return (
    <nav aria-label="Navegação principal">
      {navigation.map(([to, label]) => (
        <NavLink key={to} to={to} end={to === '/'}>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
