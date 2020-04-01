const MongoClient = require("mongodb").MongoClient;
const dbname = "PaiGinGun"
const uri = "mongodb+srv://pggAdmin:pggPassword@cluster0-va1nq.mongodb.net/test?retryWrites=true&w=majority";
const ObjectId = require('mongodb').ObjectID;
const collectionName = "Friends"

const authen = require('./authentication')


    var friendObject =
    {
        User1:"",
        User2:""
    }

    var friendRequestSchema =
    {
        requesterID:"",
        recipientID:""
    }

//User send friend request to another user
module.exports.sendFriendRequest =  function(UserID, email){

    return new Promise(async (resolve,reject)=>{ 

      console.log(email)

      //Get UserID from email address (person that user wants to add)
        var recID = await authen.getUserID(email).catch((reject) =>{

          //if error. Example: if user does not exist in the system
          resolve(reject)
        })

        

        //Check if the friend request that is being tried already exists or not (A request B exists or B request A exists)
        var checkRequestPending = await checkFriendRequest(UserID, recID)

        //Check if already a friend or not
        var checkFriendExists = await checkFriend(UserID, recID)




        //Check if adding self
        if(UserID == recID){
          resolve({
            isAddingSelf: true,
            message: "You cannot add yourself silly"
          })
        }

        
        else if(checkRequestPending == true)
        {
          resolve({
            requestExists: true,
            message: "There is already a pending friend request"
          })
        }
        //If no errors or logical problem
        else if(checkFriendExists == false){

          MongoClient.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }, (err, client) => {
            if (err) {
                reject(err)
              return
            }
            const db = client.db(dbname)
            const collection = db.collection("FriendRequest")

            //FriendRequest Object to be stored in DB
            var obj = {
              requesterID: UserID,
              recipientID: recID
            }
    
            collection.insertOne(obj, (err, result) => {
              if (err) reject(err)
              resolve({
                  message: "Friend Request Sent"
              })

              client.close()
              
            })
          })
        }

        //if  friend already exists
        else {
          resolve({
            friendExists: true,
            message: "Friend already exists"
          })
        }

        
    })
  
}


//When user accepts friend request
module.exports.acceptFriendRequest =  function(requestID){

    return new Promise(async (resolve,reject)=>{

      var friendRequest = await findRequest(requestID)

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

            //Change from friend  request to friend

            var obj = {
              User1: friendRequest.requesterID,
              User2: friendRequest.recipientID
          }

            collection.insertOne(obj, (err, result) => {
              if (err) reject(err)
              resolve({
                  message: "Friend Added"
              })

              client.close()    
            })
          })

          //delete request (already friends)
          deleteRequest(requestID)
    })
}

module.exports.rejectFriendRequest =  function(requestID){

    return new Promise((resolve,reject)=>{

      //delete friend request
      var result = deleteRequest(requestID)

      resolve(result)
    })
  
}

//Get all friend requests for the user
module.exports.getAllPendingRequest = function(UserID){

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
          const collection = db.collection("FriendRequest")

          //Query to find friend request directed towards user
          var query = {recipientID: UserID}

          collection.find(query).toArray(async (err, items) => {
            if (err) reject(err)

            await Promise.all(items.map(async (item)=>{

            //Return User information (from Firebase, based on UserID)
            var requesterInfo = await authen.getUser(item.requesterID)
            
            item.requesterInfo = requesterInfo

            }))

            resolve(items)

            client.close()
        })
      })
  })
}

//Get all friends to show in frontend
module.exports.getAllFriends = function(UserID){

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


        //Query to find friends
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

            var arr = []
            var selectUserID

            //Prepare data for frontend requirement
            await Promise.all(items.map(async (item)=>{

              if(item.User1 == UserID){
                selectUserID = item.User2
              }

              else{
                selectUserID = item.User1
              }

              //Get user info about person sending the friend request
              var user = await authen.getUser(selectUserID)

              arr.push({
                _id: item._id,
                UserInfo: user
              })

            }))

            resolve(arr)

            client.close()
        })
      })
})

}




//Local functions

//Finding a particular friend request
function findRequest(requestID){

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
          const collection = db.collection("FriendRequest")

          var query = {_id: ObjectId(requestID)}

          collection.find(query).toArray(async (err, items) => {
            if (err) reject(err)

            resolve(items[0])

            client.close()
        })
      })
  })
}

//Deleting friend request
function deleteRequest(requestID){

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
          const collection = db.collection("FriendRequest")

          var query = {_id: ObjectId(requestID)}

          collection.deleteOne(query, (err, items) => {
            if (err) reject(err)

            resolve({
              message: "Deleted Request"
            })

            client.close()
        })
      })
  })
}

//Unfriending a friend
module.exports.deleteFriend = function(friendID){

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

          var query = {_id: ObjectId(friendID)}

          collection.deleteOne(query, (err, items) => {
            if (err) reject(err)

            resolve({
              message: "Friend Deleted"
            })

            client.close()
        })
      })
  })
}

//Check if friend already exists
function checkFriend(UserID, recID){

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

          //Query to see if friends or not
          var query = {
            $or: [
              {
                $and:[
                  {
                    User1: UserID
                  },
                  {
                    User2: recID
                  }
                ]
              },
              {
                $and:[
                  {
                    User1: recID
                  },
                  {
                    User2: UserID
                  }
                ]
              }
            ]
            
          }
  
          collection.find(query).toArray(async (err, items) => {
              if (err) reject(err)
              //Check if result array is empty
              if(items.length!=0)
                resolve(true)
              else resolve(false)
  
              client.close()
          })
      })
  })
}

//Check if friend request already exists
function checkFriendRequest(UserID, recID){

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
          const collection = db.collection("FriendRequest")

          var query = {
            $or: [
              {
                $and:[
                  {
                    requesterID: UserID
                  },
                  {
                    recipientID: recID
                  }
                ]
              },
              {
                $and:[
                  {
                    requesterID: recID
                  },
                  {
                    recipientID: UserID
                  }
                ]
              }
            ]
            
          }
  
          collection.find(query).toArray(async (err, items) => {
              if (err) reject(err)
              //Check if result array is empty
              if(items.length!=0)
                resolve(true)
              else resolve(false)
  
              client.close()
          })
      })
  })
}
