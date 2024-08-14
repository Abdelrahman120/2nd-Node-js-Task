import { v4 as uuid } from "uuid";
import * as fs from "fs";
import { validationResult } from "express-validator";

const dataFilePath = './data.json';
let data = {};

function loadData() {
    if (fs.existsSync(dataFilePath)) {
        const rawData = fs.readFileSync(dataFilePath, 'utf8');
        data = JSON.parse(rawData);
    }
}

function saveData() {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
}

loadData();

export const createUser = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(err => ({
            type: "field",
            msg: err.msg,
            path: err.param,
            location: err.location
        })) });
    }

    const newData = req.body;
    const id = uuid();
    data[id] = newData;
    saveData();
    res.status(201).json({ id, ...newData });
};

export const getUsers = (req, res) => {
    const result = applyFiltersAndSort(req.query);
    res.status(200).json(result);
};

export const updateUser = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(err => ({
            type: "field",
            msg: err.msg,
            path: err.param,
            location: err.location
        })) });
    }

    const { id } = req.query;
    if (!id || !data[id]) {
        return res.status(404).json({ message: "Invalid ID" });
    }

    const updatedData = req.body;
    data[id] = { ...data[id], ...updatedData };
    saveData();
    res.status(200).json(data[id]);
};

export const deleteUser = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(err => ({
            type: "field",
            msg: err.msg,
            path: err.param,
            location: err.location
        })) });
    }

    const { id } = req.query;
    if (!id || !data[id]) {
        return res.status(404).json({ message: "Invalid ID" });
    }

    delete data[id];
    saveData();
    res.status(200).json({ message: "User deleted successfully" });
};

function applyFiltersAndSort(query) {
    let filteredData = Object.values(data);

    if (query.name) {
        filteredData = filteredData.filter(item =>
            item.name.toLowerCase().includes(query.name.toLowerCase())
        );
    }

    if (query.age) {
        filteredData = filteredData.filter(item =>
            item.age === parseInt(query.age)
        );
    }

    if (query.country) {
        filteredData = filteredData.filter(item =>
            item.country.toLowerCase().includes(query.country.toLowerCase())
        );
    }

    if (query.sort === "age") {
        filteredData.sort((a, b) => a.age - b.age);
    }

    return filteredData;
}
