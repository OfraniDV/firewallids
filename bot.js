require('dotenv').config();
const { Telegraf } = require('telegraf');
const { pool } = require('./psql/db');

// Creamos el bot con el token que hemos obtenido de BotFather
const bot = new Telegraf(process.env.BOT_TOKEN);



module.exports = bot;
