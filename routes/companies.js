const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const ExpressError = require("../expressError");

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
        const results = await db.query('SELECT c.code, c.name, c.description, i.industry FROM companies AS c LEFT JOIN company_industry as ci ON c.code = ci.company_code LEFT JOIN industries as i ON i.code = ci.industry_code WHERE c.code=$1', [req.params.code])

        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404)
        }

        let { code, name, description } = results.rows[0];
        let industries = results.rows.map(r => r.industry);

        return res.status(200).json({companies: code, name, description, industries});

    } catch (e) {
        next(e)
    }
})

router.post('/:code', async (req, res, next) => {
    try {
        const { industry_code } = req.body;
        const company_code = req.params.code
        const results = await db.query('INSERT INTO company_industry (company_code, industry_code) VALUES ($1, $2) RETURNING *', [company_code, industry_code]);

        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404)
        }

        return res.status(201).json({industry: results.rows});

    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const code = slugify(req.body.name, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g,
        });
        const { name, description } = req.body;
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