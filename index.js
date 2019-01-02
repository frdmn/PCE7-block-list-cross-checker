const chalk = require('chalk');
const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');

// Get password as passed argument
const args = process.argv;

// Configuration
const AUTH_URL="http://www.pceo.online/wp-login.php?action=postpass"
const BLACKLIST_URL="http://www.pceo.online/pce7-block-list/"

// Use cookie jar to store and reuse auth cookie
const cookieJar = request.jar();

/**
 * Function to display a certain error message and quit process
 * @param {String} msg Error message to display
 * @param {Integer} status Return code to exit with, defaults to 1
 */
function exit(msg, status=1){
    console.log(chalk.bgRed('[Error]') + ' ' +  msg)
    process.exit(status);
}

// Check if configuration file exists
if (!fs.existsSync('./config.2json')) {
    exit('configuration file "config.json" doesn\'t exist!');
}

// Load configuration
const config = require('./config.json');

// Load node-xbox module and pass API token from config
const xbox = require('node-xbox')(config.apiToken);

/**
 * Function to send the passed password to the password-protected
 * page to retrieve and store a valid cookie
 * @param {Bool} cb callback
 */
function sendAuthenticationRequest(cb){
    request.post(AUTH_URL, {form: { post_password: config.password }, jar: cookieJar},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                return cb(true);
            } else {
                return cb(false);
            }
        }
    );
}

/**
 * Function to retrieve the blocked users by sending a
 * request that contains the authenticated cookie
 * @param {String|Bool} cb callback
 */
function getBlockList(cb){
    request.get(BLACKLIST_URL, {jar: cookieJar},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                return cb(response.body);
            } else {
                return cb(false);
            }
        }
    )
}

/**
 * Function to retriev your own personal Xuid
 * of your Xbox Live gamertag
 * @param {String|Bool} cb callback
 */
function retrieveOwnXuidFromXboxApi(cb){
    xbox.account.accountXuid(function(error, response){
        if (!error){
            return cb(JSON.parse(response))
        } else {
            return cb(false);
        }
    });
}

/**
 * Function to retriev all friends of a certain gamertag (Xuid)
 * @param {Integer} xuid Xuid of the person you want to query friends list
 * @param {String|Bool} cb callback
 */
function retrieveFriends(xuid, cb){
    xbox.profile.friends(xuid, function(error, response){
        if (!error){
            return cb(JSON.parse(response))
        } else {
            return cb(false);
        }
    });
}

// Empty arrays to holds users
const blockedUsers = [];
const friendUsers = [];

console.log('Trying to authenticate against password protection on www.pceo.online...');
sendAuthenticationRequest(function(success){
    if (success){
        console.log('Requesting full and up-to-date block list...');
        getBlockList(function(result){
            if (result){
                const $ = cheerio.load(result);

                $('.entry-content p').slice(1).each(function (){
                    const username = $(this).text().trim().replace(/^[0-9]+\.\s/g, "");
                    if(username.replace(/\s/g,"") != ""){
                        blockedUsers.push(username);
                    }
                });

                console.log('Collected ' + blockedUsers.length + ' gamertags from the block list.')
                console.log('Get own Xuid from XboxAPI...')
                retrieveOwnXuidFromXboxApi(function(res){
                    const xuid = res.xuid;
                    const gamertag = res.gamertag;
                    console.log('Retrieve friends of "' + gamertag + '"...')
                    retrieveFriends(xuid, function(res){

                        res.forEach(function(friend){
                            friendUsers.push(friend);
                        });

                        console.log('Collected ' + friendUsers.length + ' gamertags from the your friends list')
                        console.log(friendUsers);
                    });
                });
            }
        })
    }
});
