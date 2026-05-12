import './Table.css'
import React, {useEffect, useCallback, useRef, useMemo} from 'react';
import {sum, average} from "../../utils/Equations.ts";
import {useParams} from "react-router-dom";
import Cell from "./Cell/Cell.tsx";
import {useAppDispatch, useAppSelector} from "../../hooks.ts";
import {setSize,
  setEditable,
  setIsEditable,
  setSelectedCells,
  setAnchorCell,
  setSelectedCellData,
  setTableData,
  setColWidths,
  setRowHeights} from "../../slices/spreadsheet.ts";
// import {setTableData} from "../../slices/documents.ts";
import { setUserData } from "../../slices/auth.ts";

import {setSaving, setContextMenu} from "../../slices/ui.ts";

export default function Table() {

  const {username, id} = useParams<{ username: string, id: string }>();
  // const {userData, setUserData} = useApp()!

  const tableId = id ? parseInt(id) : 0;
  // const currentUserData = username ? userData[username] : undefined;
  const rawTable = useAppSelector((state) => state.document.tables[tableId])
  const allUserTables = useAppSelector((state) => state.auth.tables);

  const getColumnName = (index: number): string => {
    let columnName = "";
    while (index >= 0) {
      columnName = String.fromCharCode((index % 26) + 65) + columnName;
      index = Math.floor(index / 26) - 1;
    }
    return columnName;
  };


  const dispatch = useAppDispatch();
  const {N, M} = useAppSelector((state) => (state.spreadsheet.size))
  const editable = useAppSelector((state) => state.spreadsheet.editable)
  const isEditable = useAppSelector((state) => state.spreadsheet.isEditable)
  const selectedCells = useAppSelector((state) => state.spreadsheet.selectedCells)
  const anchorCell = useAppSelector((state) => state.spreadsheet.anchorCell)
  const selectedCellData = useAppSelector((state) => state.spreadsheet.selectedCellData)
  const tableData = useAppSelector((state) => state.spreadsheet.tableData)
  const colWidths = useAppSelector((state) => state.spreadsheet.colWidths)
  const rowHeights = useAppSelector((state) => state.spreadsheet.rowHeights)
  const saving = useAppSelector((state) => state.ui.saving)
  const contextMenu = useAppSelector((state) => state.ui.contextMenu)



  const columns = Array.from({ length: N }, (_, i) => getColumnName(i));
  const rows = Array.from({ length: M }, (_, i) => (i + 1).toString());



  useEffect(() => {
    if (rawTable) {
      dispatch(setSize({
        N: rawTable.N,
        M: rawTable.M
      }));
        // eslint-disable-next-line react-hooks/immutability
        dispatch(setTableData(rawTable.data));
    }
  }, [dispatch, rawTable]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    fileInputRef.current?.click();
  };

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
        dispatch(setColWidths({ ...colWidths, [id]: newSize }));
      } else {
        dispatch(setRowHeights({ ...rowHeights, [id]: newSize }));
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const editTable = useCallback((e: React.MouseEvent<HTMLTableCellElement>) => {
    const cell = e.currentTarget;
    const columnIndex = cell.getAttribute('data-header');
    const rowIndex = cell.parentElement?.querySelector('.rowID')?.textContent;

    if (columnIndex && rowIndex) {
      dispatch(setEditable(`${columnIndex}${rowIndex}`));
      dispatch(setIsEditable(true));
    }
  }, [dispatch])

  const editTableEnter = useCallback((e: React.KeyboardEvent<HTMLTableCellElement>) => {
    if ('key' in e && e.key === 'Enter' && !isEditable) {
      const cell = e.currentTarget;
      const columnIndex = cell.getAttribute('data-header');
      const rowIndex = cell.parentElement?.firstChild?.textContent;
      dispatch(setEditable(`${columnIndex}${rowIndex}`));
      dispatch(setIsEditable(true));
    }
  }, [dispatch, isEditable])


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

  const simpleEquation = useCallback((rawValue: string) => {
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
  }, [tableData])

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

  const getDisplayValue = useCallback((cellId: string) => {
    const rawValue = tableData[cellId] || "";

    if (!rawValue.startsWith("=")) return rawValue;

    const equationData = translateEquation(rawValue);
    if (equationData) {

      const range = equationData['argument'].match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
      if (!range) return "#ERROR!";

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
  }, [columns, rows, simpleEquation, tableData])



  const displayCache = useMemo(() => {
    const map: Record<string, string | undefined> = {};

    for (const key in tableData) {
      map[key] = getDisplayValue(key);
    }

    return map;
  }, [tableData]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const handleSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>,
                                                              row: string,
                                                              col: string) => {
    if (e.key === "Enter") {
      const newValue = e.currentTarget.value

      const newData = {
        ...tableData,
        [`${col}${row}`]: newValue
      }

      dispatch(setTableData(newData));
      dispatch(setEditable(''));
      dispatch(setSelectedCellData(newValue));
      dispatch(setIsEditable(false));
    }
  }, [dispatch, tableData])



  const handleClickSelect = useCallback((e: React.MouseEvent, colIndex: number, rowIndex: number) => {
    const cellId = `${columns[colIndex]}${rows[rowIndex]}`;

    if (e.shiftKey && anchorCell) {
      const range = getCellRange(
          anchorCell.r,
          rowIndex,
          anchorCell.c,
          colIndex,
          columns,
          rows
      );
      dispatch(setSelectedCells(range));
    } else {
      dispatch(setAnchorCell({ r: rowIndex, c: colIndex }));
      dispatch(setSelectedCells([cellId]));
      dispatch(setSelectedCellData(tableData[cellId] || ""));
    }
  }, [anchorCell, columns, dispatch, rows, tableData])

  // const [contextMenu, setContextMenu] = useState< {
  //   x: number,
  //   y: number,
  //   visible: boolean
  // }>({
  //   x: 0,
  //   y: 0,
  //   visible: false
  // });

  const addColumn = () => {
    dispatch(setSize({N: N+1, M: M}));
  }

  const addRow = () => {
    // setSize({...size, M: size.M + 1});
    dispatch(setSize({N: N, M: M+1}));
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(setContextMenu({ x: e.pageX, y: e.pageY, visible: true }));
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
      content = JSON.stringify({
        N: N,
        M: M,
        data: tableData,
      }, null, 2);
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

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;

        if (file.name.endsWith(".csv")) {
          const lines = content
            .replace(/\r/g, "")
            .split("\n")
            .filter((line) => line.trim() !== "");

          if (lines.length === 0) {
            alert("CSV файл пуст");
            return;
          }

          // Парсер CSV строки
          const parseCSVLine = (line: string): string[] => {
            const result: string[] = [];
            let current = "";
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];

              if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                  current += '"';
                  i++;
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === "," && !inQuotes) {
                result.push(current);
                current = "";
              } else {
                current += char;
              }
            }

            result.push(current);

            return result;
          };

          const headers = parseCSVLine(lines[0]);

          const newN = headers.length - 1;
          const newM = lines.length - 1;

          const newData: Record<string, string> = {};

          for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
            const cells = parseCSVLine(lines[rowIndex]);

            const rowNumber = rowIndex.toString();

            for (let colIndex = 1; colIndex < cells.length; colIndex++) {
              const value = cells[colIndex];

              if (value !== "") {
                const colName = getColumnName(colIndex - 1);

                newData[`${colName}${rowNumber}`] = value;
              }
            }
          }

          setSize({
            N: newN,
            M: newM,
          });

          setTableData(newData);

          alert("CSV успешно импортирован");
        }
      } catch (err) {
        console.error(err);
        alert("Ошибка импорта файла");
      }
    };

    reader.onerror = () => {
      alert("Ошибка чтения файла");
    };

    reader.readAsText(file);

    e.target.value = "";
  };

  useEffect(() => {
    stateRef.current = {
      tableData,
      size: {N, M},
      rawTable
    };
  }, [tableData, N, M, rawTable]);

  useEffect(() => {
    const closeMenu = () => dispatch(setContextMenu({ ...contextMenu, visible: false }));
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [contextMenu]);


  const saveFunction = useCallback(() => {
    if (!username || !rawTable) return;
    dispatch(setSaving('saving'));

    const updatedTable = {
      ...rawTable,
      N, M, data: tableData,
      updated_at: new Date().toISOString()
    };

    const newTables = allUserTables.map((t, i) => i === tableId ? updatedTable : t);
    dispatch(setUserData(newTables)); // Отправляем обновленный массив в authSlice
    dispatch(setSaving('saved'));
  }, [username, rawTable, N, M, tableData, allUserTables, tableId, dispatch]);

  const stateRef = useRef({ tableData, size: {N, M}, rawTable });

  const performSave = useCallback(async () => {
    dispatch(setSaving('saving'));
    const { tableData: d, size: s, rawTable: r } = stateRef.current;
    try {
      const response = await fetch(`http://127.0.0.1:8000/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: r?.name || "Без названия",
          data: d, N: s.N, M: s.M,
          updated_at: new Date().toISOString()
        }),
      });
      if (!response.ok) throw new Error();
      dispatch(setSaving('saved'));
    } catch { dispatch(setSaving('error')); }
  }, [id, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveFunction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveFunction]);



  useEffect(() => {
    const handleClosePage = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      saveFunction()
    }

    window.addEventListener('beforeunload', handleClosePage);
    return () => window.removeEventListener('beforeunload', handleClosePage);
  }, [saveFunction]);

  useEffect(() => {
    const timer = setTimeout(performSave, 500);
    return () => clearTimeout(timer);
  }, [tableData, N, M, performSave]);

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
                    <Cell
                      displayValue={displayCache[cellId]}
                      editable={editable}
                      cellId={cellId}
                      col={col}
                      row={row}
                      isSelected={isSelected}
                      handleClickSelect={handleClickSelect}
                      handleSubmit={handleSubmit}
                      editTable={editTable}
                      editTableEnter={editTableEnter}
                      colIndex={colIndex}
                      rowIndex={rowIndex}
                    />
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
            <button onClick={handleImportClick}>Импортировать файл</button>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv,.json"
          onChange={importData}
          style={{ display: 'none' }}
        />
      </div>
  );
}