'use strict'

/* eslint no-console: 0 */  // --> OFF

const fs = require('fs')
const path = require('path')
const axios = require('axios').default
const querystring = require('querystring')
const BASE = process.env.BASE || __dirname

require('dotenv').config({ path: path.join(BASE, '../.env') })

// config
const client_id = process.env.CLIENT_ID

const cacheFileName = `accessToken${process.env.ALIAS ? process.env.ALIAS : ''}.cache.json`,
    cacheFile = path.join(BASE, cacheFileName)

if (! fs.existsSync(cacheFile)) {
    console.error(`${cacheFile} does not exist. Please run 'npm run authorize' first.`)
    process.exit()
}

const token = JSON.parse(fs.readFileSync(cacheFile))

axios
    .post('https://api.tdameritrade.com/v1/oauth2/token', querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: token.refresh_token,
        access_type: 'offline',
        client_id: `${client_id}@AMER.OAUTHAP`,
    }))
    .then(({ data }) => {
        data.now = Date.now() / 1000
        console.info(JSON.stringify(data, null, 2))
        fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2))
    })
    .catch(err => {
        console.error(JSON.stringify(err, null, 2))
        console.error("It's possible that both the access token and refresh token have expired. Try running 'npm run authorize' first.")
    })
