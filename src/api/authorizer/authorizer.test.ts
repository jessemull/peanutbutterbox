import { mocked } from 'ts-jest/utils'
import OktaJwtVerifier, { Jwt } from '@okta/jwt-verifier'
import authorizer from './authorizer'

// jest.mock('@okta/jwt-verifier', () => {
//   class MockJWT {
//     async verifyAccessToken () {
//       return Promise.resolve({ claims: [] })
//     }
//   }
//   return MockJWT
// })

// jest.mock('@okta/jwt-verifier')

describe('authorizer', () => {
  it('should validate JWT and return policy', (done) => {
    OktaJwtVerifier.prototype.verifyAccessToken = async () => Promise.resolve({ claims: { sub: 'first.last@domain.com' } } as Jwt)
    const event = {
      authorizationToken: 'Bearer token',
      methodArn: 'methodArn'
    }
    const policy = {
      context: {
        claims: {
          sub: 'first.last@domain.com'
        }
      },
      policyDocument: {
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: 'methodArn'
          }
        ],
        Version: '2012-10-17'
      },
      principalId: 'user'
    }
    const callback = jest.fn().mockImplementationOnce((_, data) => {
      expect(data).toEqual(policy)
      done()
    })
    authorizer(event as any, {}, callback)
  })
  it('should catch errors', (done) => {
    OktaJwtVerifier.prototype.verifyAccessToken = async () => Promise.reject(new Error())
    const event = {
      authorizationToken: 'Bearer token',
      methodArn: 'methodArn'
    }
    const callback = jest.fn().mockImplementationOnce((error) => {
      expect(error).toEqual(new Error('Unauthorized'))
      done()
    })
    authorizer(event as any, {}, callback)
  })
  it('should catch malformed bearer token', (done) => {
    const event = {
      authorizationToken: 'InvalidBearer token',
      methodArn: 'methodArn'
    }
    const callback = jest.fn().mockImplementationOnce((error) => {
      expect(error).toEqual(new Error('Unauthorized'))
      done()
    })
    authorizer(event as any, {}, callback)
  })
})