import './Table.css'
import React, {useEffect, useCallback, useRef, useMemo} from 'react';
import {sum, average} from "../../utils/Equations.ts";
import {useBlocker, useParams} from "react-router-dom";
import Cell from "./Cell/Cell.tsx";
import {useAppDispatch, useAppSelector} from "../../hooks.ts";
import {
  setSize,
  setEditable,
  setIsEditable,
  setSelectedCells,
  setAnchorCell,
  setSelectedCellData,
  setTableData,
  setCellStyles,
  toggleCellStyle,
  setColWidths,
  setRowHeights,
  setCurrentTableIndex,
  setCurrentDocumentId,
  setTableName,
  undo,
  redo,
  recordUpdate,
  recordCellsUpdate
} from "../../slices/spreadsheet.ts";
import {updateDocumentsAndSync,} from "../../slices/documents.ts";

import {setSaving, setContextMenu} from "../../slices/ui.ts";

export default function Table() {

  const {documentId} = useParams<{ documentId: string }>();
  const username = useAppSelector((state) => state.auth.username);

  const tableId = documentId ? documentId : undefined;
  const rawTable = useAppSelector((state) =>
    state.document.tables.find(
      (table) => String(table.id) === String(tableId)
    )
  );

  const allUserTables = useAppSelector((state) => state.document.tables);

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
  const cellStyles = useAppSelector((state) => state.spreadsheet.cellStyles)
  const colWidths = useAppSelector((state) => state.spreadsheet.colWidths)
  const rowHeights = useAppSelector((state) => state.spreadsheet.rowHeights)
  const saving = useAppSelector((state) => state.ui.saving)
  const contextMenu = useAppSelector((state) => state.ui.contextMenu)


  const columns = Array.from({ length: N }, (_, i) => getColumnName(i));
  const rows = Array.from({ length: M }, (_, i) => (i + 1).toString());

  const isDirty = useMemo(() => {
    if (!rawTable) return false;

    if (rawTable.N !== N || rawTable.M !== M) return true;

    const currentKeys = Object.keys(tableData);
    const rawKeys = Object.keys(rawTable.data || {});

    if (currentKeys.length !== rawKeys.length) return true;

    if (currentKeys.some(key => tableData[key] !== rawTable.data[key])) return true;

    return JSON.stringify(cellStyles) !== JSON.stringify(rawTable.cellStyles || {});
  }, [cellStyles, tableData, N, M, rawTable]);

  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        isDirty && currentLocation.pathname !== nextLocation.pathname,
      [isDirty]
    )
  );

  useEffect(() => {
    if (rawTable) {
      dispatch(setCurrentDocumentId('id' in rawTable ? String(rawTable.id) : null));
      dispatch(setCurrentTableIndex(
        allUserTables.findIndex((table) => String(table.id) === String(tableId))
      ));
      dispatch(setTableName(rawTable.name));
      dispatch(setSize({
        N: rawTable.N,
        M: rawTable.M
      }));
      dispatch(setTableData(rawTable.data));
      dispatch(setCellStyles(rawTable.cellStyles || {}));
    }

    return () => {
      dispatch(setCurrentTableIndex(null));
      dispatch(setCurrentDocumentId(null));
    };
  }, [allUserTables, dispatch, rawTable, tableId]);

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
  }, [getDisplayValue, tableData]);

  const getCellIdByPosition = useCallback((colIndex: number, rowIndex: number) => {
    const safeColIndex = Math.min(Math.max(colIndex, 0), columns.length - 1);
    const safeRowIndex = Math.min(Math.max(rowIndex, 0), rows.length - 1);

    return `${columns[safeColIndex]}${rows[safeRowIndex]}`;
  }, [columns, rows]);

  const getCellPosition = useCallback((cellId: string) => {
    const cellData = cellId.match(/^([A-Z]+)(\d+)$/);

    if (!cellData) return null;

    const colIndex = columns.indexOf(cellData[1]);
    const rowIndex = rows.indexOf(cellData[2]);

    if (colIndex === -1 || rowIndex === -1) return null;

    return { colIndex, rowIndex };
  }, [columns, rows]);

  const selectCell = useCallback((cellId: string) => {
    const position = getCellPosition(cellId);

    if (!position) return;

    dispatch(setAnchorCell({ r: position.rowIndex, c: position.colIndex }));
    dispatch(setSelectedCells([cellId]));
    dispatch(setSelectedCellData(tableData[cellId] || ""));
  }, [dispatch, getCellPosition, tableData]);

  const selectCellByPosition = useCallback((colIndex: number, rowIndex: number) => {
    selectCell(getCellIdByPosition(colIndex, rowIndex));
  }, [getCellIdByPosition, selectCell]);

  const commitCellValue = useCallback((cellId: string, newValue: string) => {
    const oldValue = tableData[cellId] || "";

    if (newValue === oldValue) return;

    const nextTableData = { ...tableData };

    if (newValue === "") {
      delete nextTableData[cellId];
    } else {
      nextTableData[cellId] = newValue;
    }

    dispatch(recordUpdate({ cellId, oldValue }));
    dispatch(setTableData(nextTableData));
    dispatch(setSelectedCellData(newValue));
  }, [dispatch, tableData]);

  const moveSelection = useCallback((colDelta: number, rowDelta: number) => {
    const baseCellId = selectedCells[0] || getCellIdByPosition(0, 0);
    const position = getCellPosition(baseCellId);

    if (!position) return;

    selectCellByPosition(position.colIndex + colDelta, position.rowIndex + rowDelta);
  }, [getCellIdByPosition, getCellPosition, selectCellByPosition, selectedCells]);

  const getSelectedBounds = useCallback(() => {
    const positions = selectedCells
      .map(getCellPosition)
      .filter((position): position is { colIndex: number; rowIndex: number } => position !== null);

    if (positions.length === 0) return null;

    return {
      minCol: Math.min(...positions.map(({ colIndex }) => colIndex)),
      maxCol: Math.max(...positions.map(({ colIndex }) => colIndex)),
      minRow: Math.min(...positions.map(({ rowIndex }) => rowIndex)),
      maxRow: Math.max(...positions.map(({ rowIndex }) => rowIndex)),
    };
  }, [getCellPosition, selectedCells]);

  const copySelectedCells = useCallback(async () => {
    const bounds = getSelectedBounds();

    if (!bounds || !navigator.clipboard) return;

    const copiedRows: string[] = [];

    for (let rowIndex = bounds.minRow; rowIndex <= bounds.maxRow; rowIndex++) {
      const rowValues: string[] = [];

      for (let colIndex = bounds.minCol; colIndex <= bounds.maxCol; colIndex++) {
        rowValues.push(tableData[getCellIdByPosition(colIndex, rowIndex)] || "");
      }

      copiedRows.push(rowValues.join("\t"));
    }

    try {
      await navigator.clipboard.writeText(copiedRows.join("\n"));
    } catch (error) {
      console.error("Clipboard copy failed", error);
    }
  }, [getCellIdByPosition, getSelectedBounds, tableData]);

  const updateCells = useCallback((updates: Record<string, string>) => {
    const previousValues: Record<string, string> = {};
    const nextTableData = { ...tableData };

    Object.entries(updates).forEach(([cellId, value]) => {
      previousValues[cellId] = tableData[cellId] || "";

      if (value === "") {
        delete nextTableData[cellId];
      } else {
        nextTableData[cellId] = value;
      }
    });

    dispatch(recordCellsUpdate(previousValues));
    dispatch(setTableData(nextTableData));

    const firstUpdatedCell = Object.keys(updates)[0];

    if (firstUpdatedCell) {
      dispatch(setSelectedCellData(updates[firstUpdatedCell] || ""));
    }
  }, [dispatch, tableData]);

  const clearSelectedCells = useCallback(() => {
    if (selectedCells.length === 0) return;

    updateCells(Object.fromEntries(selectedCells.map((cellId) => [cellId, ""])));
  }, [selectedCells, updateCells]);

  const pasteFromClipboard = useCallback(async () => {
    const startCellId = selectedCells[0] || getCellIdByPosition(0, 0);
    const startPosition = getCellPosition(startCellId);

    if (!startPosition || !navigator.clipboard) return;

    let clipboardText = "";

    try {
      clipboardText = await navigator.clipboard.readText();
    } catch (error) {
      console.error("Clipboard paste failed", error);
      return;
    }
    const pastedRows = clipboardText.replace(/\r/g, "").replace(/\n$/, "").split("\n");
    const updates: Record<string, string> = {};

    pastedRows.forEach((rowValue, rowOffset) => {
      rowValue.split("\t").forEach((cellValue, colOffset) => {
        const colIndex = startPosition.colIndex + colOffset;
        const rowIndex = startPosition.rowIndex + rowOffset;

        if (colIndex < columns.length && rowIndex < rows.length) {
          updates[getCellIdByPosition(colIndex, rowIndex)] = cellValue;
        }
      });
    });

    if (Object.keys(updates).length === 0) return;

    updateCells(updates);
  }, [columns.length, getCellIdByPosition, getCellPosition, rows.length, selectedCells, updateCells]);

  const selectAllCells = useCallback(() => {
    const allCells = getCellRange(0, rows.length - 1, 0, columns.length - 1, columns, rows);

    dispatch(setAnchorCell({ r: 0, c: 0 }));
    dispatch(setSelectedCells(allCells));
    dispatch(setSelectedCellData(tableData[getCellIdByPosition(0, 0)] || ""));
  }, [columns, dispatch, getCellIdByPosition, rows, tableData]);

  const startEditingSelectedCell = useCallback(() => {
    const cellId = selectedCells[0] || getCellIdByPosition(0, 0);

    selectCell(cellId);
    dispatch(setEditable(cellId));
    dispatch(setIsEditable(true));
  }, [dispatch, getCellIdByPosition, selectCell, selectedCells]);

  const handleSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>, row: string, col: string) => {
    if (e.key === "Escape") {
      e.preventDefault();
      dispatch(setEditable(''));
      dispatch(setIsEditable(false));
      return;
    }

    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const newValue = e.currentTarget.value;
      const cellId = `${col}${row}`;
      const position = getCellPosition(cellId);

      commitCellValue(cellId, newValue);
      dispatch(setEditable(''));
      dispatch(setIsEditable(false));

      if (!position) {
        return;
      }

      if (e.key === "Enter") {
        selectCellByPosition(position.colIndex, position.rowIndex + 1);
      } else {
        selectCellByPosition(position.colIndex + (e.shiftKey ? -1 : 1), position.rowIndex);
      }
    }
  }, [commitCellValue, dispatch, getCellPosition, selectCellByPosition]);



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

  const selectedStyle = selectedCells.length > 0 ? cellStyles[selectedCells[0]] || {} : {};

  const handleToggleStyle = (style: 'bold' | 'italic' | 'underlined') => {
    if (selectedCells.length === 0) return;

    dispatch(toggleCellStyle({ cellIds: selectedCells, style }));
  };

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
        cellStyles,
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
      cellStyles,
      size: {N, M},
      rawTable
    };
  }, [cellStyles, tableData, N, M, rawTable]);

  useEffect(() => {
    const closeMenu = () => dispatch(setContextMenu({ ...contextMenu, visible: false }));
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [contextMenu, dispatch]);


  const saveFunction = useCallback(() => {
    if (!username || !rawTable) return;
    dispatch(setSaving('saving'));

    const updatedTable = {
      ...rawTable,
      N, M, data: tableData,
      cellStyles,
      updated_at: new Date().toISOString()
    };

    const newTables = allUserTables.map((t) => String(t.id) === String(tableId) ? updatedTable : t);
    dispatch(updateDocumentsAndSync({newTables, username}));
    dispatch(setSaving('saved'));
  }, [username, rawTable, N, M, tableData, cellStyles, allUserTables, tableId, dispatch]);

  const stateRef = useRef({ tableData, cellStyles, size: {N, M}, rawTable });

  useEffect(() => {
    const handleKeyboardShortcuts = async (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const target = e.target;
      const isTextInput = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

      if (isCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveFunction();
        return;
      }

      if (isTextInput) {
        return;
      }

      if (isCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch(undo());
        return;
      }

      if (isCtrl && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        dispatch(redo());
        return;
      }

      if (isCtrl && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAllCells();
        return;
      }

      if (isCtrl && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        await copySelectedCells();
        return;
      }

      if (isCtrl && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        await copySelectedCells();
        clearSelectedCells();
        return;
      }

      if (isCtrl && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        await pasteFromClipboard();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        clearSelectedCells();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        startEditingSelectedCell();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        moveSelection(e.shiftKey ? -1 : 1, 0);
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        dispatch(setEditable(''));
        dispatch(setIsEditable(false));
        dispatch(setContextMenu({ ...contextMenu, visible: false }));
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [
    clearSelectedCells,
    contextMenu,
    copySelectedCells,
    dispatch,
    moveSelection,
    pasteFromClipboard,
    saveFunction,
    selectAllCells,
    startEditingSelectedCell
  ]);

  useEffect(() => {
    const handleClosePage = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      saveFunction()
    }

    window.addEventListener('beforeunload', handleClosePage);
    return () => window.removeEventListener('beforeunload', handleClosePage);
  }, [saveFunction]);

  if (tableId === undefined) {
    return (
      <div className="error">
        <p>404 документ не найден</p>
      </div>
    );
  }

  return (
      <div onContextMenu={(e) => handleContextMenu(e)}>
        {blocker.state === "blocked" && (
          <div className="blocker-modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: 9999
          }}>
            <div className="blocker-modal" style={{
              background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <h3>Несохраненные изменения</h3>
              <p>Вы изменили таблицу. Точно хотите покинуть страницу без сохранения данных?</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  onClick={() => blocker.reset()}
                  style={{ padding: '8px 16px', cursor: 'pointer' }}
                >
                  Остаться
                </button>
                <button
                  onClick={() => blocker.proceed()}
                  style={{ padding: '8px 16px', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Уйти без сохранения
                </button>
              </div>
            </div>
          </div>
        )}
        <p>
          {saving === 'saving' && <span style={{color: 'orange'}}>⏳ Сохранение...</span>}
          {saving === 'saved' && <span style={{color: 'green'}}>✅ Сохранено</span>}
          {saving === 'error' && <span style={{color: 'red'}}>❌ Ошибка сохранения</span>}
        </p>
        <div className="table-toolbar">
          <button
            type="button"
            className={selectedStyle.bold ? 'active' : ''}
            onClick={() => handleToggleStyle('bold')}
            disabled={selectedCells.length === 0}
            aria-label="Жирный текст"
            title="Жирный"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className={selectedStyle.italic ? 'active' : ''}
            onClick={() => handleToggleStyle('italic')}
            disabled={selectedCells.length === 0}
            aria-label="Курсив"
            title="Курсив"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={selectedStyle.underlined ? 'active' : ''}
            onClick={() => handleToggleStyle('underlined')}
            disabled={selectedCells.length === 0}
            aria-label="Подчеркнутый текст"
            title="Подчеркнутый"
          >
            <span className="underline-icon">U</span>
          </button>
        </div>
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
                  const style = cellStyles[cellId] || {};

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
                      bold={style.bold}
                      italic={style.italic}
                      underlined={style.underlined}
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
