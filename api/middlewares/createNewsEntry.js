const db = require('./database');
const { DateTime } = require('luxon');

async function createNewsEntry(title, description, author) {
    try {
        const nowTallinn = DateTime.now().setZone('Europe/Tallinn').toMillis();

        const [result] = await db.promise().execute(
            `INSERT INTO news (title, description, user_id, created_at) VALUES (?, ?, ?, ?)`,
            [title, description, author, nowTallinn]
        );
        return {
            id: result.insertId,
            title,
            description,
            author
        };
    } catch (error) {
        console.error('Error creating news entry:', error);
        throw new Error('Failed to create news entry');
    }
}

module.exports = createNewsEntry;