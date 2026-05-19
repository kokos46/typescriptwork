import {useState, type FormEvent} from "react";
import {Link, Navigate, useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../hooks.ts";
import {registerUser} from "../../slices/auth.ts";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secondPassword, setSecondPassword] = useState('');
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {status, error} = useAppSelector((state) => state.auth);

  const validateForm = () => {
    if (!name.trim()) {
      return 'Введите имя';
    }

    if (!emailRegex.test(email)) {
      return 'Введите корректный email';
    }

    if (password.length < 8) {
      return 'Пароль должен быть не короче 8 символов';
    }

    if (password !== secondPassword) {
      return 'Пароли не совпадают';
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
      await dispatch(registerUser({
        username: name.trim(),
        email: email.trim(),
        password,
      })).unwrap();
      navigate('/login');
    } catch {
      setFormError('');
    }
  };

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="register">
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Имя" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name"/>
        <input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email"/>
        <input type="password" placeholder="Пароль" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password"/>
        <input type="password" placeholder="Подтверждение пароля" value={secondPassword} onChange={(event) => setSecondPassword(event.target.value)} autoComplete="new-password"/>
        {(formError || error) && <p>{formError || error}</p>}
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Регистрируем...' : 'Зарегистрироваться'}
        </button>
      </form>
      <Link to="/login">Уже есть аккаунт</Link>
    </div>
  )
}
