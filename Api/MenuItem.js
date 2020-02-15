const express = require('express');
const menuItemRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemRouter.param('menuItemId', (req, res, next, menuItemId) => {
    db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${menuItemId}`, (err, row) => {
        if (err) {
            next(err);
        } else if (!row) {
            return res.sendStatus(404);
        } else {
            req.menuItem = row;
            next();
        }
    })
});

menuItemRouter.get('/', (req, res, next) => {
const sql = `SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${req.params.menuId}`;
db.all(sql, (err, rows) => {
    if (err) {
        next(err);
    } else {
        res.status(200).json({menuItems: rows});
    }
});
});

menuItemRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name,
          description = req.body.menuItem.description,
          inventory = req.body.menuItem.inventory,
          price = req.body.menuItem.price;
    if (!name || !description || !inventory || !price) {
        return res.sendStatus(400);
    }
    const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) '+
    'VALUES ($name, $description, $inventory, $price, $menu_id)';
    const values = {
        $name: name, 
        $description: description, 
        $inventory: inventory, 
        $price: price, 
        $menu_id: req.params.menuId
    };
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`, (err, row) => {
                res.status(201).json({menuItem: row});
            })
        }
    });
      
});

menuItemRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name,
          description = req.body.menuItem.description,
          inventory = req.body.menuItem.inventory,
          price = req.body.menuItem.price;
    if (!name || !description || !inventory || !price) {
        return res.sendStatus(400);
    }
    const sql = 'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price '+
    'WHERE MenuItem.id = $menuItemId';
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuItemId: req.params.menuItemId
    }
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, (err, row) => {
                return res.status(200).json({menuItem: row});
            })
        }
    })
});

menuItemRouter.delete('/:menuItemId', (req, res, next) => {
    db.run(`DELETE FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, function(err) {
        if (err) {
            next(err);
        } else {
            return res.sendStatus(204);
        }
    });
});


module.exports = menuItemRouter;