import './Table.css'
import {useState, useEffect} from 'react';
import {sum, average} from "../../utils/Equations.ts";
import {useParams} from "react-router-dom";
import {useApp} from "../../AppContext.tsx";

export default function Table() {

  const {username, id} = useParams<{ username: string, id: string }>();
  const {userData} = useApp()!

  const tableId = id ? parseInt(id) : 0;
  const currentUserData = username ? userData[username] : undefined;
  const tableGlobalData = currentUserData?.tables[tableId];

  const getColumnName = (index: number): string => {
    let columnName = "";
    while (index >= 0) {
      columnName = String.fromCharCode((index % 26) + 65) + columnName;
      index = Math.floor(index / 26) - 1;
    }
    return columnName;
  };

  const [size, setSize] = useState<{N: number, M: number}>({N: 26, M: 100})

  useEffect(() => {
    if (tableGlobalData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSize({
        N: tableGlobalData.N,
        M: tableGlobalData.M
      });
        // eslint-disable-next-line react-hooks/immutability
        setTableData(tableGlobalData.data);
    }
  }, [tableGlobalData]);

  const columns = Array.from({ length: size.N }, (_, i) => getColumnName(i));
  const rows = Array.from({ length: size.M }, (_, i) => (i + 1).toString());

  const [editable, setEditable] = useState('');
  const [tableData, setTableData] = useState<Record<string, string>>({});
  const [isEditable, setIsEditable] = useState(false);

  // Измененные состояния для работы с диапазоном
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [anchorCell, setAnchorCell] = useState<{ r: number, c: number } | null>(null);
  const [selectedCellData, setSelectedCellData] = useState("");

  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});

  const startResizing = (
    e: React.MouseEvent,
    id: string,
    type: 'col' | 'row'
  ) => {
    e.preventDefault();
    const startPos = type === 'col' ? e.pageX : e.pageY;
    const startSize = (e.currentTarget.parentElement as HTMLElement)[type === 'col' ? 'offsetWidth' : 'offsetHeight'];

    const onMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = type === 'col' ? moveEvent.pageX : moveEvent.pageY;
      const newSize = Math.max(50, startSize + (currentPos - startPos));

      if (type === 'col') {
        setColWidths(prev => ({ ...prev, [id]: newSize }));
      } else {
        setRowHeights(prev => ({ ...prev, [id]: newSize }));
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const editTable = (e: React.MouseEvent<HTMLTableCellElement>) => {
    const cell = e.currentTarget;
    const columnIndex = cell.getAttribute('data-header');
    const rowIndex = cell.parentElement?.querySelector('.rowID')?.textContent;

    if (columnIndex && rowIndex) {
      setEditable(`${columnIndex}${rowIndex}`);
      setIsEditable(true);
    }
  }

  const editTableEnter = (e: React.KeyboardEvent<HTMLTableCellElement>) => {
    if ('key' in e && e.key === 'Enter' && !isEditable) {
      const cell = e.currentTarget;
      const columnIndex = cell.getAttribute('data-header');
      const rowIndex = cell.parentElement?.firstChild?.textContent;
      setEditable(`${columnIndex}${rowIndex}`);
      setIsEditable(true);
    }
  }


  const translateEquation = (equation: string): Record<string, string> | undefined => {
    const startChar: string = '=';
    const endChar: string = '(';
    const startCharArg: string = "(";
    const endCharArg: string = ")";

    const startIndex = equation.indexOf(startChar);
    const endIndex = equation.indexOf(endChar);
    const startIndexArg = equation.indexOf(startCharArg);
    const endIndexArg = equation.indexOf(endCharArg);

    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex
      && startIndexArg < endIndexArg && startIndexArg !== -1 && endIndexArg !== -1) {
      return {"equationType": equation.substring(startIndex + 1, endIndex),
              "argument" : equation.substring(startIndexArg + 1, endIndexArg),};
    }
  }

  const getDisplayValue = (cellId: string) => {
    const rawValue = tableData[cellId] || "";

    if (!rawValue.startsWith("=")) return rawValue;

    const equationData = translateEquation(rawValue);
    if (equationData) {

      const range = equationData['argument'].match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
      if (!range) return "#ERROR!"; // Если формат диапазона неверный

      // Получаем индексы и ячейки (используем вашу логику)
      const startCol = range[1].toUpperCase().charCodeAt(0) - 65;
      const startRow = parseInt(range[2]) - 1;
      const endCol = range[3].toUpperCase().charCodeAt(0) - 65;
      const endRow = parseInt(range[4]) - 1;

      const cellsInRange = getCellRange(startRow, endRow, startCol, endCol, columns, rows);
      const values = cellsInRange.map(id => {
        const v = parseFloat(tableData[id] || "0");
        return isNaN(v) ? 0 : v;
      });

      switch (equationData["equationType"].toLowerCase()) {
        case "sum":
          return sum(values).toString();
        case "average":
          return average(values).toString();
        default:
          return "#ERROR!";
      }
    }
    return simpleEquation(rawValue);
  }

  const simpleEquation = (rawValue: string) => {
    if (!rawValue.includes("+") && !rawValue.includes("*")) return;
    const equationData = rawValue.match(/([A-Z]+)(\d+)([+*])([A-Z]+)(\d+)/);
    if (equationData) {
      switch (equationData[3]) {
        case "+":
          return (Number.parseFloat(tableData[`${equationData[1]}${equationData[2]}`])
              +Number.parseFloat(tableData[`${equationData[4]}${equationData[5]}`])).toString();
        case "*":
          return (Number.parseFloat(tableData[`${equationData[1]}${equationData[2]}`])
              *Number.parseFloat(tableData[`${equationData[4]}${equationData[5]}`])).toString();
      }
    }
  }

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>,
                                                              row: string,
                                                              col: string) => {
    if (e.key === "Enter") {
      const newValue = e.currentTarget.value


      setTableData(prev => ({
        ...prev,
        [`${col}${row}`]: newValue
      }));
      setEditable('');
      setSelectedCellData(newValue);
      setIsEditable(false);
    }
  }

  const getCellRange = (
      startR: number,
      endR: number,
      startC: number,
      endC: number,
      columns: string[],
      rows: string[]
  ): string[] => {
    const range: string[] = [];
    const minR = Math.min(startR, endR);
    const maxR = Math.max(startR, endR);
    const minC = Math.min(startC, endC);
    const maxC = Math.max(startC, endC);

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        range.push(`${columns[c]}${rows[r]}`);
      }
    }
    return range;
  };

  const handleClickSelect = (e: React.MouseEvent, colIndex: number, rowIndex: number) => {
    const cellId = `${columns[colIndex]}${rows[rowIndex]}`;

    if (e.shiftKey && anchorCell) {
      // Логика выделения диапазона
      const range = getCellRange(
          anchorCell.r,
          rowIndex,
          anchorCell.c,
          colIndex,
          columns,
          rows
      );
      setSelectedCells(range);
    } else {
      setAnchorCell({ r: rowIndex, c: colIndex });
      setSelectedCells([cellId]);
      setSelectedCellData(tableData[cellId] || "");
    }
  }

  const [contextMenu, setContextMenu] = useState< {
    x: number,
    y: number,
    visible: boolean
  }>({
    x: 0,
    y: 0,
    visible: false
  });

  const addColumn = () => {
    setSize({...size, N: size.N + 1});
  }

  const addRow = () => {
    setSize({...size, M: size.M + 1});
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, visible: true });
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu({ ...contextMenu, visible: false });
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [contextMenu]);

  return (
      <div onContextMenu={(e) => handleContextMenu(e)}>
        <input type="text" value={selectedCellData} className="cellDataEntry" readOnly/>
        <table id="table">
          <thead>
          <tr>
            <th></th>
            {columns.map((col) => (
                <th key={col} style={{ width: colWidths[col] || 100, position: 'relative' }}>
                  {col}
                  <div
                    className="resizer-col"
                    onMouseDown={(e) => startResizing(e, col, 'col')}
                  />
                </th>
            ))}
          </tr>
          </thead>
          <tbody>
          {rows.map((row, rowIndex) => (
              <tr key={row} style={{ height: rowHeights[row] || 30 }}>
                <td className='rowID'>
                  {row}
                  <div
                    className="resizer-row"
                    onMouseDown={(e) => startResizing(e, row, 'row')}
                  />
                </td>
                {columns.map((col, colIndex) => {
                  const cellId = `${col}${row}`;
                  const isSelected = selectedCells.includes(cellId);

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
                                   defaultValue={tableData[cellId] || ''} />
                        ) : <p>{getDisplayValue(cellId)}</p>}
                      </td>
                  )
                })}
              </tr>
          ))}
          </tbody>
        </table>
        {contextMenu.visible && (
          <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x, position: 'absolute' }}>
            <div onClick={addColumn}>Добавить столбец</div>
            <div onClick={addRow}>Добавить строку</div>
          </div>
        )}
      </div>
  );
}