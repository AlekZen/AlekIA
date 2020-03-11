// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();


// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.AddMensaje = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  const snapshot = await admin.database().ref('/mensajes').push({original: original});
  // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
  res.redirect(303, snapshot.ref.toString());
});


//Llenado para Dialog Flow Alek
exports.dfAlek = functions.https.onRequest((request, response) => {
    console.log('Request headers: ' + JSON.stringify(request.headers));
    console.log('Request body: ' + JSON.stringify(request.body));

    // An action is a string used to identify what needs to be done in fulfillment
    let action = request.body.result.action; // https://dialogflow.com/docs/actions-and-parameters
    console.log('Actions = '+ JSON.stringify(action));

    let query = request.body.result.resolvedQuery;

    // Parameters are any entites that Dialogflow has extracted from the request.
    const parameters = request.body.result.parameters; // https://dialogflow.com/docs/actions-and-parameters

    // Contexts are objects used to track and store conversation state
    const inputContexts = request.body.result.contexts; // https://dialogflow.com/docs/contexts

    if(action === 'firebase.update'){
        let userId = 'Alek.Zen';
        // Check if the user is in our DB
        admin.firestore().collection('users').where('userId', '==', userId).limit(1).get()
            .then(snapshot => {
                let user = snapshot.docs[0]
                if (!user) {
                    // Add the user to DB
                    admin.firestore().collection('users').add({
                        userId: userId
                    }).then(ref => {
                        sendResponse('Usuario agregado a la DB Alek');
                    });
                } else {
                    // User in DB
                    sendResponse('El usuario ya existe');
                }
            });
    }

    // Function to send correctly formatted responses to Dialogflow which are then sent to the user
    function sendResponse (responseToUser) {
        // if the response is a string send it as a response to the user
        if (typeof responseToUser === 'string') {
            let responseJson = {};
            responseJson.speech = responseToUser; // spoken response
            responseJson.displayText = responseToUser; // displayed response
            response.json(responseJson); // Send response to Dialogflow
        } else {
            // If the response to the user includes rich responses or contexts send them to Dialogflow
            let responseJson = {};

            // If speech or displayText is defined, use it to respond (if one isn't defined use the other's value)
            responseJson.speech = responseToUser.speech || responseToUser.displayText;
            responseJson.displayText = responseToUser.displayText || responseToUser.speech;

            // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
            responseJson.data = responseToUser.richResponses;

            // Optional: add contexts (https://dialogflow.com/docs/contexts)
            responseJson.contextOut = responseToUser.outputContexts;

            response.json(responseJson); // Send response to Dialogflow
        }
    }
});
