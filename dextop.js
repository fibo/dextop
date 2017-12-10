// Support the following import syntaxes.
//
// const DextopWindow = require('dextop').Window
//
// import { DextopWindow } from 'dextop'
//
const DextopWindow = require('./DextopWindow')

module.exports = { Window: DextopWindow }
exports.default = { DextopWindow }
