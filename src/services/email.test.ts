import { mocked } from 'ts-jest/utils'
import client from '../lib/ses-client'
import { MessageInput } from '../types'
import { sendActivation, sendContactMessage, sendPasswordReset } from './email'

jest.mock('../lib/ses-client')

const baseUrl = process.env.BASE_URL as string

const { sendEmail, sendTemplatedEmail } = mocked(client)

sendEmail.mockImplementation(() => ({ promise: () => Promise.resolve() }) as any)
sendTemplatedEmail.mockImplementation(() => ({ promise: () => Promise.resolve() }) as any)

describe('email service', () => {
  it('should send activation', async () => {
    const input = {
      activationToken: 'token',
      firstName: 'firstName'
    }
    const sesParams = {
      ConfigurationSetName: 'peanutbutterbox',
      Destination: {
        ToAddresses: [
          'jessemull@gmail.com'
        ]
      },
      Template: 'Activation',
      TemplateData: `{ "firstName": "${input.firstName}", "href": "${`${baseUrl}/activate?token=${input.activationToken}`}" }`,
      Source: 'support@peanutbutterbox.org'
    }
    await sendActivation(input)
    expect(sendTemplatedEmail).toHaveBeenCalledWith(sesParams)
  })
  it('should send password reset', async () => {
    const input = {
      firstName: 'firstName',
      login: 'login',
      token: 'token'
    }
    const sesParams = {
      ConfigurationSetName: 'peanutbutterbox',
      Destination: {
        ToAddresses: [
          'jessemull@gmail.com'
        ]
      },
      Template: 'RequestPasswordReset',
      TemplateData: `{ "firstName": "${input.firstName}", "login": "${input.login}", "href": "${`${baseUrl}/reset?token=${input.token}`}", "support": "${`${baseUrl}/contact`}" }`,
      Source: 'support@peanutbutterbox.org'
    }
    await sendPasswordReset(input)
    expect(sendTemplatedEmail).toHaveBeenCalledWith(sesParams)
  })
  it('should send contact message', async () => {
    const message = {
      email: 'first.last@domain.com',
      firstName: 'firstName',
      lastName: 'lastName',
      message: 'message'
    }
    const sesParams = {
      Destination: {
        ToAddresses: [
          'contact@peanutbutterbox.org'
        ]
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: 'First Name: firstName\n' +
                  'LastName: lastName\n' +
                  'E-mail: first.last@domain.com\n\n' +
                  'message'
          },
          Text: {
            Charset: 'UTF-8',
            Data: 'First Name: firstName\n' +
                  'LastName: lastName\n' +
                  'E-mail: first.last@domain.com\n\n' +
                  'message'
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Support for firstName lastName'
        }
      },
      Source: 'support@peanutbutterbox.org'
    }
    await sendContactMessage(message as MessageInput)
    expect(sendEmail).toHaveBeenCalledWith(sesParams)
  })
})
