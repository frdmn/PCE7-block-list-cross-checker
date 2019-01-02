const request = require('request');
const cheerio = require('cheerio');

// Get password as passed argument
const args = process.argv;

// Configuration
const AUTH_URL="http://www.pceo.online/wp-login.php?action=postpass"
const BLACKLIST_URL="http://www.pceo.online/pce7-block-list/"
const PCE7_PASSWORD = args[2];

// Use cookie jar to store and reuse auth cookie
const cookieJar = request.jar();

function sendAuthenticationRequest(cb){
    request.post(AUTH_URL, {form: { post_password: PCE7_PASSWORD }, jar: cookieJar},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                return cb(true);
            } else {
                return cb(false);
            }
        }
    );
}

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

const blockedUsers = [];

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

                console.log('Collected ' + blockedUsers.length + ' gamertags from the block list')
            }
        })
    }
});
