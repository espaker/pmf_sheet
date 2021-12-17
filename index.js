'use strict'

const { google } = require("googleapis");
const axios = require('axios')
const dotenv = require('dotenv');
 
const env = {...process.env, ...dotenv.config({}).parsed} || process.env

const sheets = google.sheets({version: "v4", auth: env.GOOGLE_KEY});


const alphabetPosition = char => char[char.length - 1].toUpperCase().charCodeAt()-65

const getDoc = async () => {
    try {
        const doc = await sheets.spreadsheets.values.get({
            spreadsheetId: env.SPREADSHEET_ID,
            range: env.SHEET_TITLE

        })

        return doc.data.values.filter(row => row[alphabetPosition(env.FILTER_COLUMN)] == env.FILTER_VALUE)[0] || false
    } catch (error) {
        console.error(error)
        return false    
    }
}

const getResult = async () => {
	try {
        const doc = await getDoc()
		
		if (doc[alphabetPosition(env.TRIGGER_COLUMN)] !== env.TRIGGER_VALUE) {
            const chats_id = env.CHATS_ID.split(',')
            const promises =  chats_id.map(id => axios.post(`https://api.telegram.org/${env.BOT_ID}:${env.BOT_KEY}/sendMessage`, {chat_id: id, text: doc.join(', ')}))

            await Promise.all(promises)
			process.exit(0)
		}
	} catch(e) {
	}
}

const main = async () => {
    await setInterval(getResult, parseInt(env.UPDATE_TIME)*1000)
}

main()