process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let amz;

beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('amazon', 'Amazon Inc', 'e-commerce and shipping company') RETURNING code, name, description`);

    amz = result.rows[0]
})

afterEach(async function() {
    await db.query("DELETE FROM companies");
});

afterAll(async function() {
    await db.end();
});

describe("GET /companies/:code", function(){
    test("Get 1 company", async function() {
        const response = await request(app).get('/companies/amazon');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({companies:[amz]})
    });

    test('Receive 404 if not found', async function() {
        const response = await request(app).get('/companies/microsoft');
        expect(response.statusCode).toBe(404);
    });
})

describe("POST /companies", function(){
    test("Post a company", async function() {
        const response = await request(app)
        .post('/companies')
        .send({
            name: "Tesla",
            description: "Electric Car Manufacturer"
        });
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            companies: [{
                code: "tesla",
                name: "Tesla",
                description: "Electric Car Manufacturer"
            }]
        })
    });
})

describe("PATCH /companies/:code", function(){
    test("Update a company", async function() {
        const response = await request(app)
        .patch('/companies/amazon')
        .send({
            name: "Amazon",
            description: "E-commerce"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            companies: [{
                code: "amazon",
                name: "Amazon",
                description: "E-commerce"
            }]
        })
    });

    test('Receive 404 if not found', async function() {
        const response = await request(app).patch('/companies/microsoft');
        expect(response.statusCode).toBe(404);
    });
})

describe("DELETE /companies/:code", function(){
    test("Delete a company", async function() {
        const response = await request(app).delete('/companies/amazon')
        expect(response.body).toEqual({
            status: "deleted"
        })
    });
})