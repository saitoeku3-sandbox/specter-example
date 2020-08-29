import { Request, Response } from '@specter/client'
import { Service } from '@specter/specter'
import { v4 as uuid } from 'uuid'
import {
  User,
  UserCreateResponse,
  UserReadResponse,
  UserUpdateResponse,
  UserDeleteResponse,
} from './types'

const initialUser: User = {
  id: uuid(),
  name: 'saitoeku3',
  age: 21,
}

export class UserService extends Service {
  #users: { [id: string]: User } = {}

  constructor(config: object) {
    super('user', config)
    this.#users[initialUser.id] = initialUser
  }

  async create(
    req: Request<{}, {}, Omit<User, 'id'>>
  ): Promise<UserCreateResponse> {
    const user: User = {
      id: uuid(),
      ...req.body,
    }

    this.#users[user.id] = user

    return new Response(
      {},
      {
        user,
      }
    )
  }

  async read(): Promise<UserReadResponse> {
    return new Response<{}, { users: User[] }>(
      {},
      {
        users: Object.values(this.#users),
      }
    )
  }

  async update(
    req: Request<{}, {}, Partial<Omit<User, 'id'>> & Pick<User, 'id'>>
  ): Promise<UserUpdateResponse> {
    const { id, ...params } = req.body
    const user = this.#users[id]
    const updated: User = {
      id,
      name: params.name ?? user.name,
      age: params.age ?? user.age,
    }

    this.#users[id] = updated

    return new Response(
      {},
      {
        user: updated,
      }
    )
  }

  async delete(
    req: Request<{}, {}, { id: string }>
  ): Promise<UserDeleteResponse> {
    const { id } = req.body

    this.#users = Object.keys(this.#users).reduce(
      (users: { [id: string]: User }, userId) => {
        if (id !== userId) {
          users[userId] = this.#users[userId]
        }
        return users
      },
      {}
    )

    return new Response({}, {})
  }
}
