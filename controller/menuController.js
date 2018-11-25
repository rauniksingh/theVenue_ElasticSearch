const RecipeModel = require('../models/recipe');
const __ = require('../utils/response');
class Menu {
    async addRecipe (req, res) {
        try {
            let insertRecipe = await RecipeModel.create({
                recipeType : req.body.recipeType,
                cost : req.body.cost,
                description : req.body.description,
                name : req.body.name,
                ingredients : req.body.ingredients
            })
            return __.successMsg(res, insertRecipe, 'recipe added successfully');
        } catch (error) {
            return __.errorMsg(res, 500, 'internal server error', error)
        }
    }

}

module.exports = new Menu();