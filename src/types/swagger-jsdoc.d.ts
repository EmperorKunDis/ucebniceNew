declare module 'swagger-jsdoc' {
  namespace swaggerJsdoc {
    interface Options {
      definition?: object
      swaggerDefinition?: object
      apis?: string[]
    }
  }

  function swaggerJsdoc(options: swaggerJsdoc.Options): object
  export = swaggerJsdoc
}
