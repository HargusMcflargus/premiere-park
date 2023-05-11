const firebaseConfig = {
  apiKey: "AIzaSyADUeWhMlU-Oesi-r7zfHmWOznd1nwJXis",
  authDomain: "premier-park-85017.firebaseapp.com",
  projectId: "premier-park-85017",
  storageBucket: "premier-park-85017.appspot.com",
  messagingSenderId: "983080526293",
  appId: "1:983080526293:web:a90dd7f67f640ddb799d5c"
};


firebase.initializeApp(firebaseConfig);

const db = firebase.firestore()
const auth = firebase.auth()

const charts = document.querySelectorAll(".chart");

async function countInstancesByMonth(chart) {
  
  let monthCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // Initialize an array of length 12 with 0's
  await db.collection("reservations").get().then( async resevationsDocs => {
    resevationsDocs.forEach( async document => {
      const data = await document.data()
      monthCounts[ data.from.toDate().getMonth() ] += 1
    });
  })
  return await monthCounts;
}

$(document).ready(function () {
  $(".data-table").each(function (_, table) {
    $(table).DataTable();
  });
  charts.forEach(async (chart) => {
    await countInstancesByMonth().then( async dates => {
      const final = await dates
      var ctx = chart.getContext("2d");
      var myChart =  new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
          datasets: [
            {
              label: "Reservation Requests",
              data: final,
              // backgroundColor: [
              //   "rgba(255, 99, 132, 0.2)",
              //   "rgba(54, 162, 235, 0.2)",
              //   "rgba(255, 206, 86, 0.2)",
              //   "rgba(75, 192, 192, 0.2)",
              //   "rgba(153, 102, 255, 0.2)",
              //   "rgba(255, 159, 64, 0.2)",
              // ],
              // borderColor: [
              //   "rgba(255, 99, 132, 1)",
              //   "rgba(54, 162, 235, 1)",
              //   "rgba(255, 206, 86, 1)",
              //   "rgba(75, 192, 192, 1)",
              //   "rgba(153, 102, 255, 1)",
              //   "rgba(255, 159, 64, 1)",
              // ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
      
    })
  });
});


// firebase.auth().onAuthStateChanged( (user) => {
//   if(user){
//     // IF USER IS LOGGED IN LOGIC
//   }
//   else{
//     window.location.replace("landing.html")
//   }
// })