$(document).ready( () => {
    if(auth.currentUser){
        window.location.replace("dashboard.html")
    }

    $("form").on("submit", async (submitResponse) => {
        submitResponse.preventDefault()
        await auth.signInWithEmailAndPassword($("#emailAddress").val(), $("#password").val())
            .then( async (user) =>{
                const userUID = auth.currentUser.uid
                sessionStorage.setItem("uid", userUID)
                await db
                    .collection("users")
                    .doc(userUID)
                    .get()
                    .then( document => {
                        const documentData = document.data()
                        if( documentData.userType == "user" ){
                            if( documentData.subscriptionDateEnd.seconds * 1000 <= new Date().getTime() ){
                                window.location.replace("subscription.html")
                            }
                            else if( documentData.subscriptionType == ""){
                                window.location.replace("subscription.html")
                            }
                            else{
                                window.location.replace("androidView.html")
                            }
                        }
                        else{
                            Swal.fire({
                                title: "User Not Found",
                                icon: "error"
                            })
                        }
                    })
            })
            .catch( (error) => {
                let errorMessage = "An Error Has occured"
                
                if(error.code.indexOf("wrong-password")){
                    errorMessage = "Password do not Match"
                }
                else if(error.code.indexOf("too")){
                    errorMessage = "Too Many Attempts has been made"
                }else{
                    errorMessage = "User Not Found"
                }
                Swal.fire({
                    title: errorMessage,
                    icon: "error"
                })
            })
    })

})