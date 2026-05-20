// @vitest-environment jsdom
import '../test/setupDom';
import { describe, it, expect, afterEach } from 'vitest';
import { createElement } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import NotFound from './NotFound';

describe('NotFound', () => {
  afterEach(() => cleanup());

  it('renders 404 message', () => {
    render(createElement(NotFound));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404 not found');
  });
});
