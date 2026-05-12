import './App.css';
import {useParams, Link} from "react-router-dom";
import { useApp } from './AppContext.tsx';
import {useAppDispatch, useAppSelector} from "./hooks.ts";
import {setCreating, setRenaming} from "./slices/ui.ts";
import {createTable, duplicateTable, renameTable, deleteTable, setActiveTable} from "./slices/documents.ts";

function App() {

  const dispatch = useAppDispatch()
  const {username} = useParams<{ username: string }>();
  const {userData} = useApp()!

  const creating = useAppSelector((state) => state.ui.creating)
  const renaming = useAppSelector((state) => state.ui.renaming)

  const currentUserData = username ? userData[username] : undefined;
  const tables = currentUserData?.tables || [];

  const handleCreateTable = (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.key === "Enter") {
      const tableName = e.currentTarget.value;
      if (tableName && username) {
        dispatch(createTable(tableName));
        dispatch(setCreating(false));
      }
    }
  }

  const handleDuplicate = (tableId: number) => {
    const table = structuredClone(tables[tableId]);
    if (username){
      table.name = table.name + " копия"

      dispatch(duplicateTable(table))
    }
  }

  const handleDelete = (tableName: string) => {
    const result = confirm("Уверены?")
    if (result && username) {
      dispatch(deleteTable(tableName))
    }
  }

  const handleRename = (e: React.KeyboardEvent<HTMLInputElement>, name: string) => {
    if (e.key === "Enter" && username) {
      const newName = e.currentTarget.value;

      if (!newName.trim()) return;

      dispatch(renameTable({name: name, newName: newName}))
      dispatch(setRenaming(false))
    }
  };

  return (
    <div className="App">
      <h1>Таблицы пользователя {username}</h1>
      <button onClick={() => setCreating(true)}>Создать новый документ</button>
      {creating && <input onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleCreateTable(e)} type="text" placeholder="Название таблицы"/>}
      {tables.map((table, tableIndex) => {
        const displayData = table.data;
        return (
            <div key={tableIndex} className="table-card">
              {
                renaming ? <input type="text" onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleRename(e, table.name)} defaultValue={table.name}/> :
                  <Link to={`/table/${username}/${tableIndex}`} onClick={() => dispatch(setActiveTable({name: table.name, active: true}))}><h3>{table.name}</h3></Link>
              }

              <button onClick={() => handleDuplicate(tableIndex)}>Дублировать документ</button>
              <button onClick={() => dispatch(setRenaming(true))}>Переименовать</button>
              {/*<button onClick={>{deleteApprove}</button>*/}
              <button className={`table${tableIndex}`} onClick={() => handleDelete(table.name)}>Удалить документ</button>

              <p className="date">
                Создано: {new Date(table.created_at).toLocaleDateString('ru-RU')}
              </p>

              <p>
                Изменено: {table.updated_at === '' && new Date(table.updated_at).toLocaleDateString('ru-RU')}
              </p>

              <table className="preview-table">
                <thead>
                <tr>
                  <th></th>
                  <th>A</th>
                  <th>B</th>
                  <th>C</th>
                </tr>
                </thead>
                <tbody>
                {['1', '2', '3'].map((rowId) => (
                  <tr key={rowId}>
                    <td className="row-label">{rowId}</td>
                    {['A', 'B', 'C'].map((colId) => {
                      const cellId = `${colId}${rowId}`;
                      return (
                        <td key={cellId}>
                          {displayData[cellId] || ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
        )
      })}
    </div>
  )
}

export default App
