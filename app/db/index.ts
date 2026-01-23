import Database from "./connect"

Database.initialize()
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
