import './App.css';
import {useParams, Link} from "react-router-dom";
import { useApp } from './AppContext.tsx';
import {useState} from "react";

function App() {

  const {username} = useParams<{ username: string }>();
  const {userData, setUserData} = useApp()!
  const [creating, setCreating] = useState(false);

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
          N: 100,
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

  return (
    <div className="App">
      <h1>Таблицы пользователя {username}</h1>
      <button onClick={() => setCreating(true)}>Создать новый документ</button>
      {creating && <input onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleCreateTable(e)} type="text" placeholder="Название таблицы"/>}
      {tables.map((table, tableIndex) => {
        const displayData = table.data;
        return (
            <div key={tableIndex} className="table-card">
              <Link to={`/table/${username}/${tableIndex}`}>
                <h3>{table.name}</h3>
              </Link>

              <p className="date">
                Создано: {new Date(table.created_at).toLocaleDateString('ru-RU')}
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
