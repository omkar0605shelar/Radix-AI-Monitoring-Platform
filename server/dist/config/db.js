import prisma from './client.js';
export const initDb = async () => {
    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error('DATABASE_URL is not defined in environment variables');
        }
        // Mask the password for safer logging if needed
        const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
        console.log(`Attempting to connect to PostgreSQL at: ${maskedUrl}`);
        await prisma.$connect();
        await prisma.$queryRaw `SELECT 1`;
        console.log('Successfully connected to PostgreSQL via Prisma');
    }
    catch (error) {
        console.error('Critical Database Connection Error:');
        console.error('Code:', error.code);
        console.error('Message:', error.message);
        if (error.code === 'P1001') {
            console.error('Hint: Can\'t reach the database server. Check if your database host is correct and reachable (not localhost on Render).');
        }
        else if (error.code === 'P1000') {
            console.error('Hint: Authentication failed. Double-check your database username and password.');
        }
        throw error;
    }
};
