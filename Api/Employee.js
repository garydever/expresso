const express = require('express');
const employeeRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const timesheetRouter = require('./Timesheet');

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
    db.get(`SELECT * FROM Employee WHERE Employee.id = ${employeeId}`, (err, row) => {
        if (err) {
            next(err);
        } else if (!row) {
            return res.sendStatus(404);
        } else {
            req.employee = row;
            next();
        }
    });
});

employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

employeeRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Employee WHERE is_current_employee = 1';
    db.all(sql, (err, rows) => {
        if (err) {
            next(err);
        } else if (rows) {
            res.status(200).send({employees: rows});
        }
    })
});

employeeRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name,
          position = req.body.employee.position,
          wage = req.body.employee.wage,
          is_current_employee = req.body.employee.is_current_employee === 0 ? 0 : 1;
    if (!name || !position || !wage) {
        return res.sendStatus(400);
    }
    const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) '+
                'VALUES ($name, $position, $wage, $is_current_employee)';
    const values = {$name: name, 
                    $position: position, 
                    $wage: wage, 
                    $is_current_employee: is_current_employee}
                    
    db.run(sql, values, function(err) {
        if (err) {
            console.log(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).send({employee: row});
                }
            })
        }
    })
});

employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).send({employee: req.employee});
});

employeeRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name,
          position = req.body.employee.position,
          wage = req.body.employee.wage,
          is_current_employee = req.body.employee.is_current_employee === 0 ? 0 : 1;
    if (!name || !position || !wage) {
        return res.sendStatus(400);
    }
    const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage, '+
    'is_current_employee = $is_current_employee WHERE Employee.id = $employeeId';
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $is_current_employee: is_current_employee,
        $employeeId: req.params.employeeId
    }
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get('SELECT * FROM Employee WHERE Employee.id = $employeeId', {
                $employeeId: req.params.employeeId
            }, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({employee: row});
                }
            })
        }
    });
});

employeeRouter.delete('/:employeeId', (req, res, next) => {
    db.run('UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId', {
        $employeeId: req.params.employeeId
    }, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, row) => {
                res.status(200).json({employee: row});
            })
        }
    })
});


module.exports = employeeRouter;