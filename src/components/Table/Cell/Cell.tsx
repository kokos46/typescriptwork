import React from 'react'

interface CellProps {
  displayValue: string | undefined;
  editable: string;
  cellId: string;
  col: string;
  row: string;
  isSelected: boolean;
  handleClickSelect: (e: React.MouseEvent<HTMLTableCellElement>, row: number, col: number) => void;
  handleSubmit: (e: React.KeyboardEvent<HTMLInputElement>, row: string, col: string) => void;
  editTable: (e: React.MouseEvent<HTMLTableCellElement>) => void;
  editTableEnter: (e: React.KeyboardEvent<HTMLTableCellElement>) => void;
  colIndex: number;
  rowIndex: number;
}

function Cell({
  displayValue,
  editable,
  cellId,
  col,
  row,
  isSelected,
  handleClickSelect,
  handleSubmit,
  editTable,
  editTableEnter,
  colIndex,
  rowIndex,
                             }: CellProps) {
  return (
    <td onDoubleClick={editTable}
    onClick={(e) => handleClickSelect(e, colIndex, rowIndex)}
    data-header={col}
    tabIndex={0}
    key={cellId}
    onKeyDown={(e) => editTableEnter(e)}
    style={{
      "border": isSelected ? "2px solid blue" : "1px solid black",
      "backgroundColor": isSelected ? "#e7f0ff" : "transparent"
    }}>
  {editable === cellId ? (
    <input type="text"
           onKeyDown={(e) => handleSubmit(e, row, col)}
           autoFocus
           defaultValue={displayValue || ''} />
  ) : <p>{displayValue}</p>}
</td>
  )
}

export default React.memo(Cell);
