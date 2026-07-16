// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill for Web APIs in Node.js test environment
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder as any
global.TextDecoder = TextDecoder as any

// jsdom does not provide PointerEvent, while Framer Motion emits one when a
// keyboard-activated motion button finishes its press interaction.
if (!global.PointerEvent) {
  global.PointerEvent = global.MouseEvent as typeof PointerEvent
}

// Mock fetch if not available (only in test environment)
if (typeof jest !== 'undefined' && !global.fetch) {
  global.fetch = jest.fn()
}

// Mock Request and Response for Next.js API routes
if (!global.Request) {
  global.Request = class Request {
    constructor(
      public url: string,
      public init?: RequestInit
    ) {}
  } as any
}

if (!global.Response) {
  global.Response = class Response {} as any
}
