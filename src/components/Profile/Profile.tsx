import {useAppSelector} from "../../hooks.ts";

export default function Profile() {

  const user = useAppSelector((state) => state.auth)

  return (
    <div>
      Имя: {user.username}
    </div>
  )
}