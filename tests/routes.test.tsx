import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from '../src/App';
describe('routes', () => {
  it.each([
    ['/', 'Início'],
    ['/projetos', 'Projetos'],
    ['/sobre', 'Sobre'],
    ['/contato', 'Contato'],
    ['/mural', 'Mural'],
  ])('renders %s', (path, title) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: title })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
