import { Response } from '@specter/client'

export type User = {
  id: string
  name: string
  age: number
}

export type UserCreateResponse = Response<{}, { user: User }>
export type UserReadResponse = Response<{}, { users: User[] }>
export type UserUpdateResponse = Response<{}, { user: User }>
export type UserDeleteResponse = Response<{}, {}>
