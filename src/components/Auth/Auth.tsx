import {useState, type FormEvent} from 'react';
import {Link, Navigate, useNavigate} from 'react-router-dom';
import {useAppDispatch, useAppSelector} from "../../hooks.ts";
import {loginUser} from "../../slices/auth.ts";
import {setLocalTables} from "../../slices/documents.ts";
import {loadTablesForUser} from "../../utils/authStorage.ts";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {status, loginStatus, error} = useAppSelector((state) => state.auth);

  const validateForm = () => {
    if (!emailRegex.test(email)) {
      return 'Введите корректный email';
    }

    if (password.length < 8) {
      return 'Пароль должен быть не короче 8 символов';
    }

    return '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError('');

    try {
      const result = await dispatch(loginUser({email: email.trim(), password})).unwrap();
      dispatch(setLocalTables(loadTablesForUser(result.user.email)));
      navigate('/dashboard');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Ошибка входа');
      console.log(err)
    }
  };

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth">
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          autoComplete="email"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Пароль"
          autoComplete="current-password"
        />
        {(formError || error) && <p>{formError || error}</p>}
        <button type="submit" disabled={loginStatus === 'loading'}>
          {loginStatus === 'loading' ? 'Входим...' : 'Войти'}
        </button>
      </form>
      <Link to="/register">Зарегистрироваться</Link>
    </div>
  );
}
