

//Function for retreiving user profile
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    document.getElementById("user_div").style.display = "block";
    document.getElementById("login_div").style.display = "none";


    var user = firebase.auth().currentUser;
    var uid, email;
    if(user != null){
      var uid = user.uid;
      var email = user.email;

      console.log(" Success ");
      console.log(" UserID: " + uid);
      //console.log(" Username: " + username);

      //Me added
      //https://firebase.google.com/docs/database/web/read-and-write
      //Read data once
      return firebase.database().ref('/users/' + uid).once('value').then((snapshot) => {
        var email = (snapshot.val() && snapshot.val().email);
        var profileImageUrl = (snapshot.val() && snapshot.val().profileImageUrl);
        var status = (snapshot.val() && snapshot.val().status);
        var uid = (snapshot.val() && snapshot.val().uid);
        var username = (snapshot.val() && snapshot.val().username);
        var website = (snapshot.val() && snapshot.val().website);
        console.log(" email: " + email);
        console.log(" profileImageUrl: " + profileImageUrl);
        console.log(" status: " + status);
        console.log(" uid: " + uid);
        console.log(" username: " + username);
        console.log(" website: " + website);
        document.getElementById("user_para").innerHTML = "Welcome to the Hooked Uploader : " + "<br />" + username;
      });
      //End things that I added
    }

  } else {
    // No user is signed in.
    document.getElementById("user_div").style.display = "none";
    document.getElementById("login_div").style.display = "block";

  }
});

//function for logging in.... not modified.
function login(){
  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;
  firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    window.alert("Error : " + errorMessage);
    // ...
  });

}

//function for logging out.... not modified.
function logout(){
  firebase.auth().signOut();
}


//functions I created.....
//Global variables
var AudioID, IngUrl;
var files = [];
var reader;
var startTime;
var stopTime;


function selectFile() {
  //document.getElementById("select").onclick = function(e){
    console.log(" step 1 ");
    var input = document.createElement('input');
    input.type= 'file';
    input.accept = "audio/*";
    input.onchange = e => {
      files = e.target.files;
      reader = new FileReader();
      //Might be able to remove this part.... test it later
      reader.onload = function() {
        //Need to add the display here
        //document.getElementById("myimg").src = reader.result;
        console.log(" File selected ");
      }
      reader.readAsDataURL(files[0]);
      //Updating the label with the file name
      //http://jsfiddle.net/SCK5A/
      //https://stackoverflow.com/questions/24245105/how-to-get-the-filename-from-the-javascript-filereader ....at the bottom with 0
      console.log(this.files[0].name);
      document.getElementById("fileLbl").innerHTML = "File Selected: " + this.files[0].name;;
    }
  input.click();
}



function uploadAudioFile() {
  //https://www.youtube.com/watch?v=ZH-PnY-JGBU
  //document.getElementById('upload').onclick = function() {

  //Checking to make sure there is an audio file
  if (files.length < 1) {
    alert(" Woah there cowboy, you don't have a file selected to upload ");
    return
  };
  console.log(" File ready " );

  //Creating a random ID for the storage
  //https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  AudioID = uuidv4().toUpperCase();
  console.log("Printing the image name:" + AudioID);

  //Setting the start and stop time
  var startMin = parseInt(document.getElementById("start_min_field").value * 60);
  startMin = startMin || 0;
  var startSec = parseInt(document.getElementById("start_sec_field").value);
  startSec = startSec || 0;
  var startTime = parseInt(startMin+=startSec)
  console.log(" startTime: " + startTime);

  var stoptMin = parseInt(document.getElementById("stop_min_field").value * 60);
  stoptMin = stoptMin || 0;
  var stopSec = parseInt(document.getElementById("stop_sec_field").value);
  stopSec = stopSec || 0;
  var stopTime = parseInt(stoptMin+=stopSec)
  console.log(" stopTime: " + stopTime);

  //Checking for title
  if(document.getElementById("title_field").value.length == 0) { 
    alert("Come on pal give your music a title before uploading");
    return; //stop the execution of function
  }

  //Checking for genre
  if(document.getElementById("genre_field").value.length == 0) { 
    alert("Come on pal give your music a genre before uploading");
    return; //stop the execution of function
  }
  
  //converting minutes and seconds into an integer for upload
  var startMin = parseInt(document.getElementById("start_min_field").value * 60);
  startMin = startMin || 0;
  var startSec = parseInt(document.getElementById("start_sec_field").value);
  startSec = startSec || 0;
  var startTime = parseInt(startMin+=startSec)
  console.log(" startTime: " + startTime);

  var stoptMin = parseInt(document.getElementById("stop_min_field").value * 60);
  stoptMin = stoptMin || 0;
  var stopSec = parseInt(document.getElementById("stop_sec_field").value);
  stopSec = stopSec || 0;
  var stopTime = parseInt(stoptMin+=stopSec)
  console.log(" stopTime: " + stopTime);

  //Doing the time logic checks
  var timeCheck = stopTime-startTime;
  console.log(" Time Check: " + timeCheck);
  
  if (timeCheck > 15) {
    alert(" Woah there cowboy, keep you selection to 15 seconds or under ");
    return; 
  }

  if (timeCheck < 5) {
    alert(" Woah there cowboy, keep you selection at least 5 seconds ");
    return; 
  }

  if (stopTime < startTime) {
    alert(" Woah there cowboy, your ending time if further along than your starting time ");
    return; 
  }


  //Uploading the file to storage
  firebase.storage().ref('audio/'+AudioID).put(files[0]);
  console.log("Upload to stoarge complete");

  var uploadTask = firebase.storage().ref('audio/'+AudioID).put(files[0]);
  //Have to add a time delay to allow time for the URL to generate from the storage.... experiment with closing this gap
  setTimeout(() => {
    uploadTask.snapshot.ref.getDownloadURL().then(function(url){
        ImgUrl = url;
        console.log(" the file URL is: " + ImgUrl);

          //Pushing the remainder of the record to the AudioFiles node
          firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
              //https://futurestud.io/tutorials/get-number-of-seconds-since-epoch-in-javascript
              const secondsSinceEpoch = Math.round(Date.now() / 1000)

              var uid = user.uid;

               
              var audioData = {
                artist: uid,
                audioUrl: ImgUrl,
                date: secondsSinceEpoch,
                genre: document.getElementById("genre_field").value,
                read: true,
                startTime: startTime,
                stopTime: stopTime,
                title: document.getElementById("title_field").value
              };
              
              // Get a key for a new Post.
              var newPostKey = firebase.database().ref().child('audioFiles').push().key;
              console.log(" step 4 ");
              // Write the new post's data simultaneously in the posts list and the user's post list.
              var updates = {};
              updates['/audioFiles/' + newPostKey] = audioData;
              console.log(" step 7 ");


              //Alerting the user that the song has been uploaded and refreshed the page
              setTimeout(function(){ 
                alert("Upload Complete");
                location.reload(); 
              }, 2000);


              return firebase.database().ref().update(updates);

              

            } else {
              console.log(" no user signed in ");
            }
          });

      });

    }, 
    5000
  );
  function errorCheck (error) {
    alert('error');
  }
}


//Function placeholder for testing new logic
function check(){
  console.log(" Button Tapped" );

}

//https://firebase.google.com/docs/database/web/read-and-write
//Updating or deleting data
function saveAudioFile(id, artist, audioUrl, date, genre, read, startTime, stopTime, title) {

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      //https://futurestud.io/tutorials/get-number-of-seconds-since-epoch-in-javascript
      const secondsSinceEpoch = Math.round(Date.now() / 1000)

      var uid = user.uid;
       
      var audioData = {
        artist: uid,
        audioUrl: ImgUrl,
        date: secondsSinceEpoch,
        genre: "test",
        read: true,
        startTime: 120,
        stopTime: 135,
        title: "for OJ"
      };
      
      // Get a key for a new Post.
      var newPostKey = firebase.database().ref().child('audioFiles').push().key;
      // Write the new post's data simultaneously in the posts list and the user's post list.
      var updates = {};
      updates['/audioFiles/' + newPostKey] = audioData;
      return firebase.database().ref().update(updates);
    } else {
      console.log(" no user signed in ");
    }
  });

}


