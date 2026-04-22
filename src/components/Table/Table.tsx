import './Table.css'
import { useState } from 'react';

interface TableSize {
    N: number;
    M: number;
}

export default function Table({ N, M }: TableSize) {

    const columns = Array.from({length: N}, (_, i) => String.fromCharCode(65+i));
    const rows = Array.from({ length: M }, (_, i) => (i+1).toString());

    const [editable, setEditable] = useState('');

    const [tableData, setTableData] = useState<Record<string, string>>({});
    
    const editTable = (e: React.MouseEvent<HTMLTableCellElement>) => {

        const cell = e.currentTarget;
        const columnIndex = cell.getAttribute('data-header');
        const rowIndex = cell.parentElement?.firstChild?.textContent;

        setEditable(`${columnIndex}:${rowIndex}`);

        console.log(columnIndex, rowIndex);
    }

    const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>, row: string, col: string) => {
        if (e.key === "Enter"){
            const newValue = e.currentTarget.value

            setTableData(prev => ({
                ...prev,
                [`${col}:${row}`]: newValue
            }));
            setEditable('');
        }
    }

    return (
        <table id="table">
            <thead>
                <tr>
                    <th></th>
                    {columns.map((col) => (
                        <th key={col}>{col}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row}>
                        <td className='rowID'>{row}</td>
                        {columns.map((col) => {
                            const cellId = `${col}:${row}`;

                            return (
                                <td onDoubleClick={editTable}
                                    data-header={col}
                                    key={cellId}>
                                    {editable === cellId ? (
                                        <input type="text" 
                                            onKeyDown={(e) => handleSubmit(e, row, col)} 
                                            autoFocus
                                            defaultValue={tableData[cellId] || ''}/>
                                    ) : <p>{tableData[cellId] || ''}</p>}
                                </td>
                            )
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}