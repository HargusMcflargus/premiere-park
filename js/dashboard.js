$(document).ready( (readyResponse) => {
    let users = 0, slots = 0
    $("#logoutBtn").click( async (eventSender) => {
        await auth.signOut()
            .then( (signoutResponse) => {
                sessionStorage.removeItem("uid")
                window.location.replace("index.html")
            })
    })
    db.collection("users").get().then( async userDocuments => {
        userDocuments.forEach( async document => {
            const data = await document.data()
            if( data.userType === "user" ){
                users += 1
                $("#totalUsers").html(users)
            } 
        });
    })
    db.collection("parkingslots").get().then( async userDocuments => {
        userDocuments.forEach( async document => {
            slots += 1
            $("#totalSlots").html(slots)
        });
    })
})