// Create web server application
// 
// 1. Load libraries
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const morgan = require('morgan');
const { check, validationResult } = require('express-validator');
const { read } = require('fs');
const { connect } = require('http2');
// 2. Create an instance of express
const app = express();
// 2a. Set the port number
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;
// 2b. Configure the app
app.use(morgan('combined'));
app.use(cors());
// 2c. Specify the directory for static resources
app.use(express.static(__dirname + '/public'));
// 2d. Add support for POST message and JSON payload
app.use(express.json());
// 3. SQL Statements
const SQL_FIND_BY_ID = 'select * from comments where comment_id = ?';
const SQL_FIND_BY_MOVIE_ID = 'select * from comments where movie_id = ?';
const SQL_INSERT = 'insert into comments (movie_id, comment) values (?, ?)';
const SQL_DELETE = 'delete from comments where comment_id = ?';
// 4. Create a connection pool to the database
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'leisure',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 4,
    timezone: '+08:00'
});
// 5. Start the server
app.listen(PORT, () => {
    console.info(`Application started on port ${PORT} at ${new Date()}`);
});
// 6. Resources
// 6a. GET /comments/:id
app.get('/comments/:id',
    async (req, resp) => {
        const id = req.params.id;
        const conn = await pool.getConnection();
        try {
            const result = await conn.query(SQL_FIND_BY_ID, [id]);
            if (result[0].length <= 0) {
                resp.status(404);
                resp.type('application/json');
                resp.json({ message: `comment ID ${id} not found` });
                return;
            }
            resp.status
