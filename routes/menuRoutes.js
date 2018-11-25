const express = require('express');
const Router = express.Router();
const controller = require('../controller/menuController');
Router.all('*', (req, res, next) => {
    console.log(req.body);
    next();
});

Router.post('/addNewRecipes', controller.addRecipe);
module.exports = Router

