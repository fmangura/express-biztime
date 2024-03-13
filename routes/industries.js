const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const ExpressError = require("../expressError");

const db = require("../db");


router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT code, industry FROM industries')

        return res.status(200).json({industries: results.rows});

    } catch (e) {
        next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const results = await db.query('SELECT i.code, i.industry, c.name FROM industries AS i LEFT JOIN company_industry as ci ON i.code = ci.industry_code LEFT JOIN companies as c ON c.code = ci.company_code WHERE i.code=$1;',[req.params.code])

        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find an industry with code of ${req.params.code}`, 404)
        }

        let { code, industry } = results.rows[0];
        let companies = results.rows.map(r => r.name);

        return res.status(200).json({industries: code, industry, companies});

    } catch (e) {
        next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const code = slugify(req.body.name, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g,
        });
        const { industry } = req.body;
        const results = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *', [code, industry]);

        return res.status(201).json({industry: results.rows});

    } catch (e) {
        return next(e);
    }
})

module.exports = router;