const express = require('express');
const router = express.Router();

const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT * FROM invoices')
        return res.json({invoices: results.rows})
    } catch (e) {
        next(e)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query('SELECT id, amt, paid, add_date, paid_date, comp_code FROM invoices WHERE id = $1', [id]);

        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404)
        }

        const { comp_code } = results.rows[0];
        const companyresults = await db.query('SELECT code, name, description FROM companies WHERE code = $1', [comp_code]);

        return res.json({invoices: results.rows, companies: companyresults.rows});

    } catch (e) {
        next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *', [comp_code, amt]);

        return res.status(201).json({invoices: results.rows});

    } catch (e) {
        return next(e);
    }
})

router.patch('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt } = req.body;
        const results = await db.query('UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *', [amt, id]);

        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with code of ${code}`, 404);
        }
        return res.status(200).json({invoices: results.rows});

    } catch (e) {
        return next(e);
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const results = await db.query('DELETE FROM invoices WHERE id = $1', [req.params.id]);
        return res.send({ status: "deleted"});

    } catch (e) {
        return next(e)
    }
})

module.exports = router;