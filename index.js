const puppeteer = require('puppeteer');
const pino = require('pino')
const pretty = require('pino-pretty')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const logger = pino(pretty({
    ignore: 'pid,hostname,appname',
    translateTime: 'SYS:ddd mmm dd yyyy hh:MM:ss TT',
    messageFormat: '{appname}: {msg}',
})).child({ appname: "WISHNET-AUTOLOGIN" });


const argv = yargs(hideBin(process.argv)).options({
    u: { type: 'string', alias: 'username', description: 'wishnet username' },
    p: { type: 'string', alias: 'password', description: 'wishnet password' },
    c: { type: 'string', alias: 'chrome', description: 'path to google chrome browser' },
  }).help().demand(['username','password','chrome']).argv


  if(!argv.username || !argv.u){
    logger.error("wishnet username is required")
    process.exit();
  }

  if(!argv.password || !argv.p){
    logger.error("wishnet password is required")
    process.exit();
  }

  if(!argv.chrome || !argv.c){
    logger.error("path to google chrome browser is required")
    process.exit();
  }




const LOGIN_FORM_URL = 'http://192.168.182.201:9085/CHR6/WISHS/Login.jsp';
const LOGIN_CRED = {
    Username: argv.username,
    Password: argv.password 
}

async function run() {
    const browser = await puppeteer.launch({
        headless: true,
        devtools: false,
        executablePath: argv.chrome 
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
