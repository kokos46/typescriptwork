import {useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../hooks.ts";
import {logoutUser} from "../../slices/auth.ts";
import {clearDocuments} from "../../slices/documents.ts";

export default function Profile() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user)

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(clearDocuments());
    navigate('/login', {replace: true});
  };

  return (
    <div>
      {user?.username && <p>Имя: {user.username}</p>}
      <p>Email: {user?.email}</p>
      <button onClick={handleLogout}>Выйти</button>
    </div>
  )
}
