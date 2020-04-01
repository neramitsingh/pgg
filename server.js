const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')


const MongoClient = require("mongodb").MongoClient;
const dbname = "PaiGinGun"
const uri = "mongodb+srv://pggAdmin:pggPassword@cluster0-va1nq.mongodb.net/test?retryWrites=true&w=majority";
const ObjectId = require('mongodb').ObjectID;

const authen = require('./authentication')
const event = require('./event')
const friend = require('./friend')



const app = express()
const port = 3030




app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use(cors())




app.get('/', async (req, res) => {

    res.send({
        message: "PGG is running woooh!"
    })

})

//Add an Event
app.post('/addEvent', async (req, res) => {

    var token = req.headers.authorization.substring(7)
    console.log(token)

    var dateObject = req.body

    authen.isAuthenticated(token).then(async (resolve) => {

            //Needs to get from authentication
            dateObject.UserID = resolve.uid

            var result = await event.addEvent(req.body)

            res.send(result)
        })
        .catch((reject) => {

            res.send(reject)
        })

})


//Get list of events for a user
app.get('/getEvents/User', async (req, res) => {

    //Get token from header

    var token = req.headers.authorization.substring(7)

    //Check if user is signed in
    authen.isAuthenticated(token).then(async (resolve) => {

            var result = await event.getAllEventsForUser(resolve.uid)

            res.send(result)

        })
        .catch((reject) => {

            res.send(reject)
        })
})

app.get('/getEvent/:eventID', async (req, res) => {

    //Get token from header
    var token = req.headers.authorization.substring(7)

    var eventID = req.params.eventID

    authen.isAuthenticated(token).then(async (resolve) => {

        var UserID = resolve.uid

        var result = await event.getEvent(eventID, UserID)

        res.send(result)

    })
    .catch((reject) => {

        res.send(reject)
    })
})

app.delete('/deleteEvent/:eventID', async (req, res) => {

    //Get token from header
    var token = req.headers.authorization.substring(7)

    var eventID = req.params.eventID

    authen.isAuthenticated(token).then(async (resolve) => {

        var result = await event.deleteEvent(eventID)

        res.send(result)

    })
    .catch((reject) => {

        res.send(reject)
    })
})

app.post('/updateEvent/:eventID', async (req, res) => {

    //Get token from header
    var token = req.headers.authorization.substring(7)

    var updateObj = req.body
    console.log(updateObj);

    var eventID = req.params.eventID

    authen.isAuthenticated(token).then(async (resolve) => {
        var UserID = resolve.uid

        var result = await event.updateEvent(eventID, updateObj, UserID)
        console.log(result);
        res.send(result)

    })
    .catch((reject) => {
        console.log(result);
        res.send(reject)
    })
})

//User sends a friend request
app.post('/addFriend', async (req, res) => {

    //Get token from header

    var token = req.headers.authorization.substring(7)
    console.log(token)

    var email = req.body.email

    authen.isAuthenticated(token).then(async (resolve) => {


            //Needs to get from authentication
            
            var UserID = resolve.uid

            var result = await friend.sendFriendRequest(UserID, email)

            res.send(result)
        })
        .catch((reject) => {

            res.send(reject)
        })

})

//User accepts friend request
app.post('/acceptFriendRequest', async (req, res) => {

    //Get token from header

    var token = req.headers.authorization.substring(7)
    console.log(token)

    var requestID = req.body.requestID

    authen.isAuthenticated(token).then(async (resolve) => {

            var result = await friend.acceptFriendRequest(requestID)

            res.send(result)
        })
        .catch((reject) => {

            res.send(reject)
        })

})

//User rejects friend request
app.post('/rejectFriendRequest', async (req, res) => {

    //Get token from header

    var token = req.headers.authorization.substring(7)
    console.log(token)

    var requestID = req.body.requestID

    authen.isAuthenticated(token).then(async (resolve) => {

            var result = await friend.rejectFriendRequest(requestID)

            res.send(result)
        })
        .catch((reject) => {

            res.send(reject)
        })
})



//Get all pending friend request for  user
app.get('/getAllPendingRequest', async (req, res) => {

    //Get token from header

    var token = req.headers.authorization.substring(7)
    console.log(token)

    authen.isAuthenticated(token).then(async (resolve) => {

            var UserID = resolve.uid

            var result = await friend.getAllPendingRequest(UserID)

            res.send(result)
        })
        .catch((reject) => {

            res.send(reject)
        })
})


//Get all friends
app.get('/getAllFriends', async (req, res) => {

    //Get token from header

    var token = req.headers.authorization.substring(7)
    console.log(token)

    authen.isAuthenticated(token).then(async (resolve) => {

            var UserID = resolve.uid

            var result = await friend.getAllFriends(UserID)

            res.send(result)
        })
        .catch((reject) => {

            res.send(reject)
        })
})

//delete friend
app.delete('/deleteFriend/:friendID', async (req, res) => {

    console.log("Deleting friend")

    //Get token from header
    var token = req.headers.authorization.substring(7)

    var friendID = req.params.friendID

    console.log(friendID)

    authen.isAuthenticated(token).then(async (resolve) => {

        var result = await friend.deleteFriend(friendID)

        res.send(result)

    })
    .catch((reject) => {

        res.send(reject)
    })
})









app.listen(port, () => console.log(`PGG backend listening on port ${port}!`))