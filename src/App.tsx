import './App.css';
import {useParams, Link} from "react-router-dom";
import { useApp } from './AppContext.tsx';
import {useState} from "react";

function App() {

  const {username} = useParams<{ username: string }>();
  const {userData, setUserData} = useApp()!
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(false);

  const currentUserData = username ? userData[username] : undefined;
  const tables = currentUserData?.tables || [];

  const handleCreateTable = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // e.preventDefault()

    if (e.key === "Enter") {
      const tableName = e.currentTarget.value;
      if (tableName && username) {
        const newTable = {
          name: tableName,
          created_at: new Date().toISOString(),
          updated_at: "",
          N: 28,
          M: 100,
          data: {}
        };

        // currentUserData?.tables.push(newTable);
        setUserData({
          ...userData,
          [username] : {
            ...userData[username],
            tables : [
              ...userData[username]?.tables || [],
              newTable
            ]
          }
        })
        setCreating(false);
      }
    }
  }

  const handleDuplicate = (tableId: number) => {
    const table = structuredClone(tables[tableId]);
    if (username){
      table.name = table.name + " копия"

      setUserData({
        ...userData,
        [username] : {
          ...userData[username],
          tables : [
            ...userData[username]?.tables || [],
            table
          ]
        }
      })
    }
  }

  const handleDelete = (tableId: number) => {
    const result = confirm("Уверены?")
    if (result && username) {
      setUserData({
        ...userData,
        [username] : {
          ...userData[username],
          tables : userData[username]?.tables?.filter((_, index) => index !== tableId)
        }
      })
    }
  }

  const handleRename = (e: React.KeyboardEvent<HTMLInputElement>, tableIndex: number) => {
    if (e.key === "Enter" && username) {
      const newName = e.currentTarget.value;

      if (!newName.trim()) return;

      setUserData({
        ...userData,
        [username]: {
          ...userData[username],
          tables: userData[username].tables.map((table, index) => {
            if (index === tableIndex) {
              return {
                ...table,
                name: newName
              };
            }
            return table;
          })
        }
      });
      setRenaming(false)
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
                renaming ? <input type="text" onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleRename(e, tableIndex)} defaultValue={table.name}/> :
                  <Link to={`/table/${username}/${tableIndex}`}><h3>{table.name}</h3></Link>
              }

              <button onClick={() => handleDuplicate(tableIndex)}>Дублировать документ</button>
              <button onClick={() => setRenaming(true)}>Переименовать</button>
              {/*<button onClick={>{deleteApprove}</button>*/}
              <button className={`table${tableIndex}`} onClick={() => handleDelete(tableIndex)}>Удалить документ</button>

              <p className="date">
                Создано: {new Date(table.created_at).toLocaleDateString('ru-RU')}
              </p>

              <p>
                Изменено: {new Date(table.updated_at).toLocaleDateString('ru-RU')}
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
