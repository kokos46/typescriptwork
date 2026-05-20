// @vitest-environment jsdom
import '../../../test/setupDom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createElement } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Cell from './Cell';

const defaultProps = {
  displayValue: '42',
  editable: '',
  cellId: 'A1',
  col: 'A',
  row: '1',
  isSelected: false,
  handleClickSelect: vi.fn(),
  handleSubmit: vi.fn(),
  editTable: vi.fn(),
  editTableEnter: vi.fn(),
  colIndex: 0,
  rowIndex: 0,
};

const renderCell = (props = {}) =>
  render(
    createElement(
      'table',
      null,
      createElement(
        'tbody',
        null,
        createElement(
          'tr',
          null,
          createElement(Cell, { ...defaultProps, ...props })
        )
      )
    )
  );

describe('Cell', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders display value', () => {
    renderCell();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows input when cell is editable', () => {
    renderCell({ editable: 'A1' });
    expect(screen.getByRole('textbox')).toHaveValue('42');
  });

  it('calls handleClickSelect on click', () => {
    const handleClickSelect = vi.fn();
    const { container } = renderCell({ handleClickSelect });
    const cell = container.querySelector('td')!;
    fireEvent.click(cell);
    expect(handleClickSelect).toHaveBeenCalled();
  });

  it('applies bold style', () => {
    renderCell({ bold: true });
    const cellText = screen.getByText('42');
    expect(cellText).toHaveStyle({ fontWeight: 'bold' });
  });
});
