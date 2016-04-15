var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var os = require('os');
var app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification https://intense-brook-23735.herokuapp.com/webhook/
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        if (event.message && event.message.text) {
          if (getFirstWord(event.message.text).toLowerCase() === '@same') {
              text = event.message.text.substr(event.message.text.indexOf(" ") + 1)
              if (['uptime', 'identify yourself', 'who are you', 'what is your name', 'what is your name?'].indexOf(text.toLowerCase()) >= 0) {
                var hostname = os.hostname()
                var uptime = formatUptime(process.uptime())
                sendTextMessage(sender, ':|] I am a bot named <@' + "same"+'>. I have been running for ' + uptime + ' on ' + hostname + '.')
                continue
              }
              if (text.toLowerCase() === 'same') {
                  sendTextMessage(sender, text.substring(0, 200))
                  continue
              }
              sendTextMessage(sender, text.substring(0, 200) + ": not same")
            }
        }
        if (event.postback) {
            text = JSON.stringify(event.postback)
            sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
            continue
        }
    }
    res.sendStatus(200)
})
function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendGenericMessage(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "First card",
                    "subtitle": "Element #1 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

function getFirstWord(str) {
        if (str.indexOf(' ') === -1)
            return str;
        else
            return str.substr(0, str.indexOf(' '));
}

var token = "CAAJyRJlBLqEBAOdjcrcnZBtfYuyuJFyvQqSADBbWFj8baZCpLTHbKbc6TAtYjJHX51QWuO3OlP48zmzzMa5NHkfJAmoZBKtVE5qsZBsqhpICTjnzxHZCYA7vTkGeDOrXFgrqv4RZCkD4T0o9pcgGMt8pfqeAH601PZATXspCgn4ZCiTcjchcvmYHYs6ImQcv4FIZD"
