const express = require('express');
const timesheetRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetRouter.param('timesheetId', (req, res, next, timesheetId) => {
    const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
    const values = {$timesheetId: timesheetId};
    db.get(sql, values, (err, row) => {
        if (err) {
            next(err);
        } else if (!row) {
            return res.sendStatus(404);
        } else {
            next();
        }
    });
});

timesheetRouter.get('/', (req, res, next) => {
const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId';
const values = {$employeeId: req.params.employeeId};
db.all(sql, values, (err, rows) => {
    if (err) {
        next(err);
    } else {
        res.status(200).json({timesheets: rows});
    }
})
});

timesheetRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours,
          rate = req.body.timesheet.rate,
          date = req.body.timesheet.date;
    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    }
    const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) '+
    'VALUES ($hours, $rate, $date, $employeeId)';
    const values = {
        $hours: hours, 
        $rate: rate, 
        $date: date, 
        $employeeId: req.params.employeeId};
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, (err, row) => {
                res.status(201).json({timesheet: row});
            })
        }
    }); 
});

timesheetRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours,
          rate = req.body.timesheet.rate,
          date = req.body.timesheet.date;
    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    }
    const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, '+
    'date = $date WHERE Timesheet.id = $timesheetId';
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $timesheetId: req.params.timesheetId
    };
    db.run(sql, values, function(err) {
        if (err) {
            next(err)
        } else {
            db.get('SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId', {
                $timesheetId: req.params.timesheetId
            }, (err, row) => {
                res.status(200).json({timesheet: row});
            })
        }
    });
});

timesheetRouter.delete('/:timesheetId', (req, res, next) => {
    db.run('DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId', {
        $timesheetId: req.params.timesheetId
    }, function(err) {
        if (err) {
            next(err);
        } else {
            return res.sendStatus(204);
        }
    });
});


module.exports = timesheetRouter;

