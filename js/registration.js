$(document).ready( (readyResponse) => {

    $("#password, #passwordRepeat").on("input", (input) =>{
        if( $("#password").val() == "" ){
            $("#password").addClass("is-invalid")
        }
        else if($("#password").val() == $("#passwordRepeat").val()){
            $("#password, #passwordRepeat").removeClass("is-invalid").addClass("is-valid")
        }
        else if($("#password").val()){
            $("#password").addClass("is-valid").removeClass("is-invalid")
        }
    })

    $("form").submit( async (event) => {
        event.preventDefault()
        if( $("#password").val() != $("#passwordRepeat").val()){
            
            $("form input.form-control").removeClass("is-invalid")
            $("#password, #passwordRepeat").addClass("is-invalid")
            Swal.fire({
                icon: "error",
                title: "Passwords do not match"
            })
            return
        }
    
        await auth.createUserWithEmailAndPassword($("#emailAddress").val(), $("#password").val())
            .then( (response) => {
                const userUID = response.user.uid
                Swal.fire({
                    icon: "success",
                    title: "Registration Success",
                    text: "You can now login with your credentials"
                })
                    .then( async (anotherResponse) => {
                        await firebase.firestore()
                            .collection("users")
                            .doc(userUID)
                            .set({
                                firstname: $("#firstName").val(),
                                lastname: $("#lastname").val(),
                                userType: "user",
                                subscriptionType: "",
                                subscriptionDateEnd: new Date(),
                                subscriptionDateStart: new Date(),
                                userReservationID: ""
                            })
                        window.location.replace("login.html")
                            
                    })
            })
            .catch( (error) => {
                Swal.fire({
                    icon: "error",
                    title: error,
                }).then( (errorResponse) => {
                    $("form").reset()
                    $("form input.form-control").removeClass("is-invald")
                })
            })
    })
})

