import Database from "./connect"

/**
 * Initializes the database connection by establishing a connection with the database
 * using the configuration provided in the environment variables.
 *
 * Logs the success details such as database name, host, and the number of entities
 * upon a successful connection.
 *
 * In case of a connection failure, logs the error and terminates the process.
 *
 * @function
 * @returns {Promise<void>} A promise that resolves when the database connection
 * is successfully initialized or rejects with an error if the connection fails.
 */
export const Init = () => {
    return Database.initialize()
        .then(() => {
            console.log('✓ Database connected successfully')
            console.log(`  Database: ${process.env.POSTGRES_DATABASE}`)
            console.log(`  Host: ${process.env.POSTGRES_HOST}`)
            console.log(`  Entities: ${Database.entityMetadatas.length}`)
        })
        .catch(err => {
            console.error('✗ Database connection failed:', err.message)
            process.exit(1)
        })
}
