const request = require("supertest");
const app = require("../server");
const Task = require("../models/Task");

describe("Task Management API Tests", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("GET /health returns 200 and OK status", async () => {
        const res = await request(app).get("/health");
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("OK");
    });

    test("GET /tasks returns 200", async () => {
        // Mock Task.find to return an array of tasks without requiring external MongoDB
        jest.spyOn(Task, "find").mockReturnValue({
            sort: jest.fn().mockResolvedValue([
                { _id: "1", title: "Test CI/CD Task", completed: false, priority: "medium" }
            ])
        });

        const res = await request(app).get("/tasks");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
