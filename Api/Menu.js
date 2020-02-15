const express = require('express');
const menuRouter = express.Router();
const menuItemRouter = require('./MenuItem');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuRouter.param('menuId', (req, res, next, menuId) => {
    const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const values = {$menuId: menuId};
    db.get(sql, values, (err, row) => {
        if (err) {
            next(err);
        } else if (!row) {
            return res.sendStatus(404);
        } else {
            req.menu = row;
            next();
        }
    });
});

menuRouter.use('/:menuId/menu-items', menuItemRouter);

menuRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu', (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({menus: rows});
        }
    })
});

menuRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
        return res.sendStatus(400);
    }
    const sql = 'INSERT INTO Menu (title) VALUES ($title)';
    const values = {$title: title};
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (err, row) => {
                res.status(201).json({menu: row});
            });
        }
    });
});

menuRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
});

menuRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
        return res.sendStatus(400);
    }
    const sql = 'UPDATE Menu SET title = $title WHERE Menu.id =  $menuId';
    const values = { $title: title, $menuId: req.params.menuId };
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (err, row) => {
                    res.status(200).json({ menu: row });
            });
        }
    });
});

menuRouter.delete('/:menuId', (req, res, next) => {
    const itemSql = `SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${req.params.menuId}`;
    db.get(itemSql, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            return res.sendStatus(400);
        } 
            const sql = `DELETE FROM Menu WHERE Menu.id = ${req.params.menuId}`;
            db.run(sql, function(err) {
                if (err) {
                    next(err);
                } else {
                    return res.sendStatus(204);
                }
            })
        
    });
});

module.exports = menuRouter;