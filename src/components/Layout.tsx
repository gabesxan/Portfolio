import { Outlet } from 'react-router-dom';
import Nav from './Nav';
export default function Layout() {
  return (
    <>
      <a href="#main">Pular para o conteúdo</a>
      <header>
        <Nav />
      </header>
      <main id="main">
        <Outlet />
      </main>
    </>
  );
}
