import { defineEventHandler, readBody, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

const LOGIN_MUTATION = `
mutation Login($username: String!, $password: String!) {
  login(input: {
    provider: PASSWORD
    credentials: {
      username: $username
      password: $password
    }
  }) {
    authToken
    authTokenExpiration
    refreshToken
    refreshTokenExpiration
    user {
      id
      databaseId
      name
      email
      firstName
      lastName
      username
      avatar { url }
      roles { nodes { name } }
    }
  }
}
`

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig() as unknown as { graphqlMiddleware: { graphqlEndpoint: string } }
  const body = await readBody(event)

  if (!body?.username || !body?.password) {
    throw createError({
      statusCode: 400,
      message: 'Username and password are required'
    })
  }

  const response = await $fetch(config.graphqlMiddleware.graphqlEndpoint, {
    method: 'POST',
    body: {
      query: LOGIN_MUTATION,
      variables: {
        username: body.username,
        password: body.password
      },
      operationName: 'Login'
    }
  })

  return response
})
