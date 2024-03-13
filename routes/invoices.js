const express = require('express');
const router = express.Router();
const ExpressError = require("../expressError")

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
            throw new ExpressError(`Can't find company with code of ${id}`, 404)
        }

        const { comp_code } = results.rows[0];
        const companyresults = await db.query('SELECT code, name, description FROM companies WHERE code = $1', [comp_code]);

        return res.status(200).json({invoices: results.rows, companies: companyresults.rows});

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
        const id = req.params.id;
        const { amt, paid } = req.body;
        const invoice = await db.query('SELECt * FROM invoices WHERE id=$1', [id]);
        console.log(invoice.rows)

        if (invoice.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with code of ${id}`, 404);
        }

        let paid_status = invoice.rows[0].paid;

        if (paid_status === false && paid === 'pay') {
            let today = new Date(Date.now());
            const results = await db.query(`UPDATE invoices SET amt=$1, paid=True, paid_date=$2 WHERE id=$3 RETURNING *`, [amt, today, id]);
            return res.status(200).json({invoices: results.rows});

        } else if (paid_status === true && paid === 'unpay') {
            const results = await db.query(`UPDATE invoices SET paid=false, paid_date=null WHERE id=$1 RETURNING *`, [id]);
            return res.status(200).json({invoices: results.rows});

        } else {
            const results = await db.query('UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *', [amt, id]);
            return res.status(200).json({invoices: results.rows});
        }

    } catch (e) {
        return next(e)
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