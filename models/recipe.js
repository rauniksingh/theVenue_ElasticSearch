const mongoose = require('mongoose');
const recipeTypeArray = require('./../recipeType')
let recipeSchema = mongoose.Schema({
recipeType: {
    type: String,
    enum: recipeTypeArray,
    required: true
},
cost: {
    type: Number,
    required: true
},
description: {
    type: String,
    required: true
},
name: {
    type: String,
    required: true
},
ingredients: {
    type: String,
    required: true
}
}, {
    timestamp: true
})

let recipeModel = mongoose.model('recipes', recipeSchema, 'recipe');
module.exports = recipeModel;