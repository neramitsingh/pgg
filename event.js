const MongoClient = require("mongodb").MongoClient;
const dbname = "PaiGinGun"
const uri = "mongodb+srv://pggAdmin:pggPassword@cluster0-va1nq.mongodb.net/test?retryWrites=true&w=majority";
const ObjectId = require('mongodb').ObjectID;
const collectionName = "Events"


//Add Event
module.exports.addEvent =  function(obj){

    return new Promise((resolve,reject)=>{

        MongoClient.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }, (err, client) => {
            if (err) {
                reject(err)
              return
            }
            const db = client.db(dbname)
            const collection = db.collection(collectionName)
    
            collection.insertOne(obj, (err, result) => {
              if (err) reject(err)
              resolve({
                  message: "Event Added",
                  _id: result.insertedId
              })
              client.close()           
            })
          })
    })
}


//Get all events for user
module.exports.getAllEventsForUser =  function(UserID){

    return new Promise(async (resolve,reject)=>{

      //Get list of all friends to be queried further
      var arrResult = await getAllUserFriends(UserID)

        MongoClient.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }, (err, client) => {
            if (err) {
                reject(err)
              return
            }
            const db = client.db(dbname)
            const collection = db.collection(collectionName)

            //Query to get events of user and friends
            var query = {
              $or: arrResult
            }
    
            collection.find(query).toArray((err, items) => {
                if (err) reject(err)
                  console.log(items)
                  resolve(items)
              client.close()
            })
          })
    })
}


//Get list of all friends for user
function getAllUserFriends(UserID){

  return new Promise((resolve,reject)=>{

      MongoClient.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }, (err, client) => {
          if (err) {
              reject(err)
            return
          }
          const db = client.db(dbname)
          const collection = db.collection("Friends")

          //Query to get the User's friends
          var query = {
            $or: [
              {
                User1: UserID
              },
              {
                User2: UserID
              }
            ]
            
          }
  
          collection.find(query).toArray(async (err, items) => {
              if (err) reject(err)

              //Add user's info (used for getAllEvent query)
              var arr = [{UserID: UserID}]

              await Promise.all(items.map((item)=>{

                if(item.User1 == UserID){

                  //Data is added to array in a format that is ready to be queried
                  arr.push({UserID: item.User2})

                }

                else{
                  arr.push({UserID: item.User1})
                }

              }))

              resolve(arr)

              client.close()
          })
        })
  })

}


//Edit event
module.exports.updateEvent = function(eventID, object,  UserID){

    return new Promise(async (resolve,reject)=>{

      var checkOwner = await this.getEvent(eventID)

      if(checkOwner.UserID != UserID){
        resolve({
          notOwner: true,
          message: "You cannot edit your friend's events"
        })
      }
      else{

        MongoClient.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }, (err, client) => {
            if (err) {
                reject(err)
              return
            }
            const db = client.db(dbname)
            const collection = db.collection(collectionName)


            //Find said event
            var query  = {
                _id: ObjectId(eventID)
            }

            //new value from request
            var newVal = {
                $set: object
            }
    
            collection.updateOne(query, newVal, (err, result) => {
              if (err) reject(err)
              console.log(result)
              resolve({
                  message: "Event Updated"
              })

              client.close()
              
            })
          })
        }
    })
}


//Get specific event
module.exports.getEvent = function(eventID, UserID){

  return new Promise((resolve,reject)=>{

      MongoClient.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }, (err, client) => {
          if (err) {
              reject(err)
            return
          }
          const db = client.db(dbname)
          const collection = db.collection(collectionName)


          var query  = {
              _id: ObjectId(eventID)
          }
  
          collection.findOne(query, (err, result)=> {
            if (err) reject(err)

            console.log(result)
            resolve(result)

            client.close()
            
          })
        })
  })
}

//Delete specific event
module.exports.deleteEvent = function(eventID){

  return new Promise((resolve,reject)=>{

      MongoClient.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }, (err, client) => {
          if (err) {
              reject(err)
            return
          }
          const db = client.db(dbname)
          const collection = db.collection(collectionName)

          //Find by ObjectId (MongoDB property)
          var query = {_id: ObjectId(eventID)}

          collection.deleteOne(query, (err, items) => {
            if (err) reject(err)

            resolve({
              message: "Deleted Event"
            })

            client.close()
        })
      })
  })
}
