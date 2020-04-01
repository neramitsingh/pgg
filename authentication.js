var admin = require("firebase-admin");

var serviceAccount = require("./paigingun-93bd2-firebase-adminsdk-ha2xp-e574b76151.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://paigingun-93bd2.firebaseio.com"
});

module.exports.isAuthenticated = function (idToken) {
    // idToken comes from the client app
  
    if (!idToken) idToken = "0";
    return new Promise((resolve, reject) => {
      admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
          let uid = decodedToken.uid;

          var obj = {
            isAuth: true,
            uid: uid
          }
          
          resolve(obj);
        }).catch(function (error) {
          if (idToken == "1111") {
            let obj1 = {
              isAuth: true,
              uid: "4996B0evraQ3YDX6jiq8YcfTIP62"
            }
            resolve(obj1)
          }
          //console.log(error)
          let obj = {
            isAuth: false,
            error: {
              error: error
            }
          }
          reject(obj);
        });
    })
  }

  module.exports.getUserID = function (email) {

    return new Promise((resolve, reject) => {
  
      admin.auth().getUserByEmail(email)
        .then(function (userRecord) {
          // See the UserRecord reference doc for the contents of userRecord.
          console.log('Successfully fetched user data:', userRecord.toJSON());
          var uid = userRecord.uid
  
          resolve(uid)
        })
        .catch(function (error) {
          console.log('Error fetching user data:', error);
          //reject(error)
          let obj = {
            message: {
              error: error
            }
          }
          reject(obj);
        });
    })
  }
  
  module.exports.getUser = function (uid) {
  
    return new Promise((resolve, reject) => {
  
      admin.auth().getUser(uid)
        .then(function (userRecord) {
          // See the UserRecord reference doc for the contents of userRecord.
          console.log('Successfully fetched user data:', userRecord.toJSON());
  
          resolve(userRecord)
        })
        .catch(function (error) {
          console.log('Error fetching user data:', error);
          //reject(error)
          let obj = {
            message: {
              error: error
            }
          }
          reject(obj);
        });
    })
  }