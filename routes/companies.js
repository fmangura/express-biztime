const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError')

const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT * FROM companies')
        return res.json({companies: results.rows})
    } catch (e) {
        next(e)
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query('SELECT code, name, description FROM companies WHERE code = $1', [code])

        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404)
        }
        return res.json({companies: results.rows});

    } catch (e) {
        next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);

        return res.status(201).json({companies: results.rows});

    } catch (e) {
        return next(e);
    }
})

router.patch('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description', [name, description, code]);

        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        }
        return res.status(200).json({companies: results.rows});

    } catch (e) {
        return next(e);
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const results = await db.query('DELETE FROM companies WHERE code = $1', [req.params.code]);
        return res.send({ status: "deleted"});

    } catch (e) {
        return next(e)
    }
})

module.exports = router;