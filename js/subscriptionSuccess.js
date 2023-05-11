Date.prototype.addDays = function(days) {
var date = new Date(this.valueOf());
date.setDate(date.getDate() + days);
return date;
}

const subscriptionStart = new Date()
const subscriptionEnd = subscriptionStart.addDays(25)

$(document).ready( ( ) => {
const doStuff = () => {
    db
        .collection("users")
        .doc(sessionStorage.getItem("uid"))
        .update({
            subscriptionType: sessionStorage.getItem("SUBSCRIPTION") / 100,
            subscriptionDateStart: subscriptionStart,
            subscriptionDateEnd: subscriptionEnd 
        })
        .then( (response) => {
            $("#redirect").toggleClass("d-none")
            window.location.replace("login.html")
        })
}
doStuff()
})