import {useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../hooks.ts";
import {logoutUser, restoreSession} from "../../slices/auth.ts";
import {clearDocuments} from "../../slices/documents.ts";
import {useState} from "react";
import * as authService from "../../api/authService.ts";

export default function Profile() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user)
  const tables = useAppSelector((state) => state.document.tables || []);

  const [newName, setNewName] = useState(user?.username || '');
  const [nameStatus, setNameStatus] = useState<string | null>(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(clearDocuments());
    navigate('/login', {replace: true});
  };

  const handleChangeName = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) {
      setNameStatus('Имя не должно быть пустым');
      return;
    }

    try {
      await authService.updateProfile({username: newName.trim()});
      await dispatch(restoreSession()).unwrap();
      setNameStatus('Имя успешно обновлено');
    } catch (err: any) {
      setNameStatus(err?.message || 'Ошибка при обновлении имени');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setPasswordStatus('Пароль должен быть не короче 6 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus('Пароли не совпадают');
      return;
    }

    try {
      await authService.changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStatus('Пароль успешно изменён');
    } catch (err: any) {
      setPasswordStatus(err?.message || 'Ошибка при смене пароля');
    }
  };

  return (
    <div style={{padding: 16}}>
      <h2>Профиль</h2>

      <div style={{marginBottom: 12}}>
        <strong>Имя:</strong> {user?.username || '-'}
      </div>

      <div style={{marginBottom: 12}}>
        <strong>Email:</strong> {user?.email || '-'}
      </div>

      <div style={{marginBottom: 12}}>
        <strong>Документов:</strong> {tables.length}
      </div>

      {user && (user as any).created_at && (
        <div style={{marginBottom: 12}}>
          <strong>Зарегистрирован:</strong> {new Date((user as any).created_at).toLocaleDateString('ru-RU')}
        </div>
      )}

      <hr />

      <form onSubmit={handleChangeName} style={{marginTop: 12, marginBottom: 12}}>
        <div>
          <label>Новое имя: <input value={newName} onChange={(e) => setNewName(e.target.value)} /></label>
        </div>
        <div style={{marginTop: 8}}>
          <button type="submit">Сменить имя</button>
        </div>
        {nameStatus && <div style={{marginTop: 8}}>{nameStatus}</div>}
      </form>

      <form onSubmit={handleChangePassword} style={{marginTop: 12, marginBottom: 12}}>
        <div>
          <label>Текущий пароль: <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} /></label>
        </div>
        <div>
          <label>Новый пароль: <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></label>
        </div>
        <div>
          <label>Подтвердите новый пароль: <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></label>
        </div>
        <div style={{marginTop: 8}}>
          <button type="submit">Сменить пароль</button>
        </div>
        {passwordStatus && <div style={{marginTop: 8}}>{passwordStatus}</div>}
      </form>

      <div style={{marginTop: 16}}>
        <button onClick={handleLogout}>Выйти</button>
      </div>
    </div>
  )
}
