import Table from "./components/Table/Table"
import {useEffect, useState} from "react";
import './App.css';

function App() {
  const [size, setSize] = useState<{N: number, M: number}>({N: 26, M: 100})

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
      <Table N={size.N} M={size.M}/>
      {contextMenu.visible && (
        <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x, position: 'absolute' }}>
          <div onClick={addColumn}>Добавить столбец</div>
          <div onClick={addRow}>Добавить строку</div>
        </div>
      )}
    </div>
  )
}

export default App
