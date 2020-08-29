import Client, { Request } from '@specter/client'
import React, { useEffect, useState, useCallback } from 'react'
import {
  User,
  UserReadResponse,
  UserCreateResponse,
  UserUpdateResponse,
} from '../domains/user'

const client = new Client({
  base: '/xhr',
})

const useUser = () => {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const request = new Request('user', {
      headers: {},
      query: {},
      body: null,
    })

    setIsLoading(true)
    client
      .read<UserReadResponse>(request)
      .then(({ body }) => {
        setUsers(body.users)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const createUser = useCallback(async (params: Omit<User, 'id'>) => {
    const request = new Request<{}, {}, Omit<User, 'id'>>('user', {
      headers: {},
      query: {},
      body: params,
    })

    setIsLoading(true)
    try {
      const { body } = await client.create<UserCreateResponse>(request)
      setUsers((users) => [...users, body.user])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateUser = useCallback(
    async (params: Partial<Omit<User, 'id'>> & Pick<User, 'id'>) => {
      const request = new Request<
        {},
        {},
        Partial<Omit<User, 'id'>> & Pick<User, 'id'>
      >('user', {
        headers: {},
        query: {},
        body: params,
      })

      setIsLoading(true)
      try {
        const { body } = await client.update<UserUpdateResponse>(request)
        setUsers((users) =>
          users.map((user) => (user.id === body.user.id ? body.user : user))
        )
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const deleteUser = useCallback(async (id: User['id']) => {
    const request = new Request<{}, {}, { id: User['id'] }>('user', {
      headers: {},
      query: {},
      body: {
        id,
      },
    })

    setIsLoading(true)
    try {
      await client.delete(request)
      setUsers((users) => users.filter((user) => user.id !== id))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    users,
    createUser,
    updateUser,
    deleteUser,
  }
}

const App: React.FC = () => {
  const { isLoading, users, createUser, updateUser, deleteUser } = useUser()
  const [name, setName] = useState('')
  const [age, setAge] = useState(20)

  // 編集用
  const [selectedUserId, setSelectedUserId] = useState<string>()
  const [selectedUserName, setSelectedUserName] = useState('')
  const [selectedUserAge, setSelectedUserAge] = useState(20)

  const handleChangeName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value),
    []
  )

  const handleChangeAge = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setAge(+event.target.value),
    []
  )

  const handleChangeSelectedUserName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setSelectedUserName(event.target.value),
    []
  )

  const handleChangeSelectedUserAge = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setSelectedUserAge(+event.target.value),
    []
  )

  const handleEditStart = useCallback((user: User) => {
    setSelectedUserId(user.id)
    setSelectedUserName(user.name)
    setSelectedUserAge(user.age)
  }, [])

  const handleEditEnd = useCallback(() => {
    setSelectedUserId(undefined)
    setSelectedUserName('')
    setSelectedUserAge(20)
  }, [])

  const handleUpdateUser = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (selectedUserId === undefined) return

      await updateUser({
        id: selectedUserId,
        name: selectedUserName,
        age: selectedUserAge,
      })
      handleEditEnd()
    },
    [selectedUserId, selectedUserName, selectedUserAge]
  )

  const handleCreateUser = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      createUser({
        name,
        age,
      })
    },
    [name, age]
  )

  return (
    <>
      <form onSubmit={handleCreateUser}>
        <div>
          <label htmlFor="name">名前</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleChangeName}
            required
          />
        </div>
        <div>
          <label htmlFor="age">年齢</label>
          <input
            id="age"
            type="number"
            value={age}
            onChange={handleChangeAge}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          追加
        </button>
      </form>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {selectedUserId === user.id ? (
              <form onSubmit={handleUpdateUser}>
                <input
                  type="text"
                  value={selectedUserName}
                  onChange={handleChangeSelectedUserName}
                  placeholder="名前"
                  required
                />
                <input
                  type="number"
                  value={selectedUserAge}
                  onChange={handleChangeSelectedUserAge}
                  placeholder="年齢"
                  required
                />
                <button type="submit" disabled={isLoading}>
                  保存
                </button>
                <button type="button" onClick={handleEditEnd}>
                  キャンセル
                </button>
              </form>
            ) : (
              <>
                <span>
                  {user.name} ({user.age})
                </span>
                <button onClick={() => handleEditStart(user)}>編集</button>
                <button
                  onClick={() => deleteUser(user.id)}
                  disabled={isLoading}
                >
                  削除
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}

export default App
