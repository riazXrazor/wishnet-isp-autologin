require('dotenv').config();
const puppeteer = require('puppeteer');
const pino = require('pino')
const logger = pino({
  transport: {
    target: 'pino-pretty'
  },
})
const LOGIN_FORM_URL = 'http://192.168.182.201:9085/CHR6/WISHS/Login.jsp';
const LOGIN_CRED = {
    Username: process.env.ISP_USERNAME,
    Password: process.env.ISP_PASSWORD
}

async function run() {
    const browser = await puppeteer.launch({
        headless: true,
        devtools: false
    });
    try {
        const page = await browser.newPage();
        await page.goto(LOGIN_FORM_URL, { timeout: 5000 });
        const isLogoutPresent = await page.$('form[name="logoutForm"]')
        if (isLogoutPresent === null) {
            logger.info("Logged out, trying to loggin...")
            await page.type('input[name="Username"]', LOGIN_CRED.Username);
            await page.type('input[name="Password"]', LOGIN_CRED.Password);
            await page.click('#submit_btn');
            logger.info("Loggedin successfully!!")
        }else{
            logger.info("Already logged in")
        }

        await browser.close();
    } catch (e) {
        if (e instanceof puppeteer.errors.TimeoutError) {
            logger.error("ISP not rechable")
        }

        await browser.close();
    } finally{
        setTimeout(function(){
            run();
        },10000)
    }
}


run();
