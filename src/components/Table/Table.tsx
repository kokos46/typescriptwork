import './Table.css'
import {useState, useEffect, useCallback, useRef} from 'react';
import {sum, average} from "../../utils/Equations.ts";
import {useParams} from "react-router-dom";
import {useApp} from "../../AppContext.tsx";

export default function Table() {

  const {username, id} = useParams<{ username: string, id: string }>();
  const {userData, setUserData} = useApp()!

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
  const [saving, setSaving] = useState('');

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

  const exportTable = (format: 'csv' | 'json') => {
    let content = ''
    let filename = `table_export_${new Date().toISOString()}`;
    let contentType = ''


    if (format === 'csv')
    {
      contentType = 'text/csv;charset=utf-8;';
      filename += '.csv';

      content += "," + columns.join(",") + "\n";

      rows.forEach(row => {
        content += row + ",";
        const rowData = columns.map(col => {
          const cellId = `${col}${row}`;
          const value = tableData[cellId] || "";
          return `"${value.toString().replace(/"/g, '""')}"`;
        });
        content += rowData.join(",") + "\n";
      });
    }
    else if (format === 'json')
    {
      contentType = 'application/json;charset=utf-8;';
      filename += '.json';
      content = JSON.stringify(tableData, null, 2);
    }

    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  useEffect(() => {
    const closeMenu = () => setContextMenu({ ...contextMenu, visible: false });
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [contextMenu]);


  const saveFunction = useCallback((event?: KeyboardEvent | BeforeUnloadEvent) => {
    if (!username) return;

    event?.preventDefault();

    const user = userData[username];
    if (!user) return;

    setSaving('saving');
    const updatedTable = {
      name: tableGlobalData?.name || "Без названия",
      created_at: tableGlobalData?.created_at || new Date().toISOString(),
      N: size.N,
      M: size.M,
      data: tableData,
      updated_at: new Date().toISOString()
    };

    setUserData({
      ...userData,
      [username]: {
        ...user,
        tables: user.tables.map((table, index) =>
          index === tableId ? updatedTable : table
        )
      }
    });
    setSaving('saved');
  }, [userData, tableData, size, username, tableId, tableGlobalData, setUserData]);

  const stateRef = useRef({ tableData, size, tableGlobalData });

  const performSave = useCallback(async () => {
    if (!id) return;

    setSaving('saving');

    const { tableData: currentData, size: currentSize, tableGlobalData: currentGlobal } = stateRef.current;

    const payload = {
      name: currentGlobal?.name || "Без названия",
      data: currentData,
      N: currentSize.N,
      M: currentSize.M,
      updated_at: new Date().toISOString()
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Server error');
      setSaving('saved');
    } catch (error) {
      setSaving('error');
    }
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's' && username) {
        saveFunction(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userData, tableData, size, username, tableId, tableGlobalData, setUserData, saveFunction]);



  useEffect(() => {
    const handleClosePage = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      saveFunction(e)
    }

    window.addEventListener('beforeunload', handleClosePage);
    return () => window.removeEventListener('beforeunload', handleClosePage);
  }, [saveFunction]);

  useEffect(() => {

    const timer = setTimeout(() => {
      performSave();
    }, 500);

    return () => clearTimeout(timer);
  }, [performSave]);

  return (
      <div onContextMenu={(e) => handleContextMenu(e)}>
        <p>
          {saving === 'saving' && <span style={{color: 'orange'}}>⏳ Сохранение...</span>}
          {saving === 'saved' && <span style={{color: 'green'}}>✅ Сохранено</span>}
          {saving === 'error' && <span style={{color: 'red'}}>❌ Ошибка сохранения</span>}
        </p>
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
            <div onClick={() => exportTable('json')}>Экспорт в JSON</div>
            <div onClick={() => exportTable('csv')}>Экспорт в CSV</div>
          </div>
        )}
      </div>
  );
}