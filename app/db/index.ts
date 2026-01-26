import Database from "./connect"
import type { DataSourceOptions } from "typeorm"

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
            const options = Database.options as DataSourceOptions
            console.log('✓ Database connected successfully')
            if (process.env.NODE_ENV !== "production") {
                console.log(`  Database: ${options.database ?? process.env.POSTGRES_DATABASE}`)
                const host =
                    "host" in options && typeof options.host === "string"
                        ? options.host
                        : process.env.POSTGRES_HOST
                console.log(`  Host: ${host}`)
            }
            console.log(`  Entities: ${Database.entityMetadatas.length}`)
        })
        .catch(err => {
            console.error('✗ Database connection failed:', err.message)
            process.exit(1)
        })
}
