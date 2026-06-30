import { NextResponse } from 'next/server'
import swaggerJsdoc from 'swagger-jsdoc'

export const dynamic = 'force-dynamic'

const getAppUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

const createOptions = (): swaggerJsdoc.Options => ({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Učebnice programování AI - API Documentation',
      version: '1.0.0',
      description: 'API dokumentace pro interaktivní učebnici programování s gamifikací a AI prvky',
      contact: {
        name: 'Martin Svanda',
      },
    },
    servers: [
      {
        url: getAppUrl(),
        description:
          process.env.NODE_ENV === 'production' ? 'Production server' : 'Application server',
      },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
          description: 'NextAuth session cookie',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            code: {
              type: 'string',
              description: 'Error code',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            name: {
              type: 'string',
              description: 'User display name',
            },
            xp: {
              type: 'integer',
              description: 'Total experience points',
            },
            level: {
              type: 'integer',
              description: 'User level',
            },
            streak: {
              type: 'integer',
              description: 'Current learning streak in days',
            },
          },
        },
        Achievement: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Achievement ID',
            },
            title: {
              type: 'string',
              description: 'Achievement title',
            },
            description: {
              type: 'string',
              description: 'Achievement description',
            },
            icon: {
              type: 'string',
              description: 'Achievement icon emoji',
            },
            xpReward: {
              type: 'integer',
              description: 'XP reward for unlocking',
            },
            category: {
              type: 'string',
              enum: ['progress', 'streak', 'skill', 'special'],
              description: 'Achievement category',
            },
          },
        },
        Chapter: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Chapter ID',
            },
            title: {
              type: 'string',
              description: 'Chapter title',
            },
            description: {
              type: 'string',
              description: 'Chapter description',
            },
            order: {
              type: 'integer',
              description: 'Chapter order number',
            },
            xpReward: {
              type: 'integer',
              description: 'XP reward for completion',
            },
            videoUrl: {
              type: 'string',
              format: 'uri',
              description: 'Video URL',
            },
          },
        },
      },
    },
    security: [
      {
        sessionAuth: [],
      },
    ],
  },
  apis: ['./src/app/api/**/*.ts'],
})

export async function GET() {
  const swaggerSpec = swaggerJsdoc(createOptions())
  return NextResponse.json(swaggerSpec)
}
