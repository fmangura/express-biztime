process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let inv;
let company;

beforeEach(async () => {
    const comp = await db.query(`INSERT INTO companies (code, name, description) VALUES ('amazon', 'Amazon Inc', 'e-commerce and shipping company') RETURNING code, name, description`);
    
    company = comp.rows[0]

    const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('amazon', '500') RETURNING *`);

    inv = result.rows[0]
})

afterEach(async function() {
    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies");
});

afterAll(async function() {
    await db.end();
});

describe("GET /invoices/:id", function(){
    test("Get first invoice", async function() {
        const response = await request(app).get(`/invoices/${inv.id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({companies: [company], invoices:[{
            id: expect.any(Number),
            comp_code: "amazon",
            amt: 500,
            paid: false,
            add_date: expect.any(String),
            paid_date: null
        }]})
    });

    test('Receive 404 if not found', async function() {
        const response = await request(app).get('/invoice/13');
        expect(response.statusCode).toBe(404);
    });
})

describe("POST /invoices", function(){
    test("Post a new invoice", async function() {
        const response = await request(app)
        .post('/invoices')
        .send({
            comp_code: "amazon",
            amt: "1000",
        });
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            invoices: [{
                id: expect.any(Number),
                comp_code: "amazon",
                amt: 1000,
                paid: false,
                add_date: expect.any(String),
                paid_date: null
            }]
        })
    });
})

describe("PATCH /invoices/:id", function(){
    test("Update an invoice", async function() {
        const response = await request(app)
        .patch(`/invoices/${inv.id}`)
        .send({
            amt: "10"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            invoices: [{
                id: expect.any(Number),
                comp_code: "amazon",
                amt: 10,
                paid: false,
                add_date: expect.any(String),
                paid_date: null
            }]
        })
    });

    test('Receive 404 if not found', async function() {
        const response = await request(app).patch('/invoices/5');
        expect(response.statusCode).toBe(404);
    });
})

describe("DELETE /invoices/:id", function(){
    test("Delete an invoice", async function() {
        const response = await request(app).delete('/invoices/0')
        expect(response.body).toEqual({
            status: "deleted"
        })
    });
})