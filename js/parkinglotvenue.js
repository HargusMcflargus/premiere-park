$(document).ready(function () {

  loadData();
  
  $("#logoutBtn").click( async () => {
    try{
        await auth.signOut()
            .then( (exitResponse) => {
                sessionStorage.removeItem("uid")
                window.location.replace("index.html")
            })
    }
    catch{

    }
})



});

// Reference to Firestore collection
var venuesRef = db.collection("venues");

const editicon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#f3deba" class="bi bi-pencil-square" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/></svg>';
const deleteicon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16"><path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/></svg>';

var filleliminate;
var filledit;



var dataSet1 = [];

var table = $('#parkingvenueTable').DataTable({
  pageLength: 5,
  lengthMenu: [[5, 10, 20, -1], [5, 10, 20, 'All']],
  searching: true,
  data: dataSet1,
  columnDefs: [
    {
      targets: [1],
      visible: false,
    },

    {
      targets: -1,
      orderable: false,
      defaultContent: 
				"<button class='btnEdit btn btn-success px-2 py-1 mx-2' data-toggle='tooltip' title='Edit'>" +
				"<i class='fa-solid fa-pen fa-sm' style='color: #ffffff;'></i></button>"+
				"<button class='btnDelete btn btn-danger px-2 py-1' data-toggle='tooltip' title='Delete'>" +		
				"<i class='fa-solid fa-trash fa-sm' style='color: #ffffff;'></i></button>"
    }
  ]
});



function loadData() {
  // Show the loading indicator
  //  document.getElementById("loading-row").style.display = "table-row";

  // Reset the table data
  table.clear().draw();

  // Fetch data from Firestore
  z = 1;
  venuesRef.orderBy('name', "asc").get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      var ps = doc.data();
      dataSet1 = [z, doc.id, ps.name, ps.address]
      z++;
      table.rows.add([dataSet1]).draw();
    });

    // Hide the loading indicator
    //  document.getElementById("loading-row").style.display = "none";
  });
}



$('#parkingvenueTable').on('click', '.btnDelete', function () {
  Swal.fire({
    title: 'Are you sure you want to delete this record?',
    // text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    reverseButtons: true,
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      var row = $(this).closest('tr');
      var data = table.row(row).data();
      var id = data[1];
      // delete record from Firestore
      
      console.log(id)
      db
        .collection("parkingslots")
        .where("venueID", "==", id)
        .get().then( (slotSnapshot) => {
          slotSnapshot.forEach( document => {
            document.ref.delete()
          })
        })
      venuesRef.doc(id).delete().then( () => {

        const table1 = $("#parkingvenueTable").DataTable();
        table1.clear().draw();
        loadData();
      }).catch(function (error) {
        console.error("Error removing document: ", error);
      })
      Swal.fire(
        'Deleted!',
        'Venue ' + id + ' has been deleted.',
        'success'
      )
    }
  })
});


// Add event listeners for edit and delete buttons
$('#parkingvenueTable').on('click', '.btnEdit', function () {
  var row = $(this).closest('tr');
  var data = table.row(row).data();
  var id = data[1];
  var name = data[2];
  var address = data[3];
  // open edit form and pre-fill fields with current data
  // handle form submission and update Firestore
  $('#changeData input[name="eid"]').val(id);
  // $('#eid').val(id);
  $('#changeData input[name="nameE"]').val(name);
  $('#changeData textarea[name="addressE"]').val(address);
  $('#exampleModal').modal('show');
});



// Handle edit form submission
$('#changeData').on('submit', function (e) {
  e.preventDefault();
  var currentid = $('#changeData input[name="eid"]').val();
  var name = $('#changeData input[name="nameE"]').val();
  var address = $('#changeData textarea[name="addressE"]').val();

  venuesRef.where("name", "==", name).get().then(function (querySnapshot) {
    if (querySnapshot.empty || (querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === currentid)) {
      venuesRef.doc(currentid).update({
        name: name,
        address: address
      }).then(function () {
        Swal.fire({
          icon: 'success',
          title: 'Record updated successfully',
        });

        const table1 = $("#parkingvenueTable").DataTable();
        table1.clear().draw();
        loadData();
        $('#exampleModal').modal('hide');
      }).catch(function (error) {
        console.error("Error updating document: ", error);
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Establishment already exists',
      });
    }
  }).catch(function (error) {
    console.error("Error getting documents: ", error);
  });
});





function checkSlotAvailability(name) {
  // use where clause to filter documents by slot and floor
  var query = venuesRef.where("name", "==", name);

  // execute the query and return a promise
  return query.get().then(function (querySnapshot) {
    // if the query returns no documents, the slot is available
    if (querySnapshot.empty) {
      return true;
    }
    // otherwise, the slot is already taken
    else {
      return false;
    }
  });
}



// define the submit handler for the form
$("#submitData").submit(function (event) {
  event.preventDefault();

  // get the values from the form
  var name = $("#nameC").val();
  var address = $("#addressC").val();

  // check if the slot is available
  checkSlotAvailability(name).then(function (available) {
    if (available) {
      // add the new document to the collection
      venuesRef.add({
        name: name,
        address: address
      });

      // close the modal
      $("#exampleModal1").modal("hide");

      // clear the form values
      $("#nameC").val("");
      $("#addressC").val("");
      // show a success message

      Swal.fire({
        // position: 'top-mid',
        icon: 'success',
        title: 'Record added successfully',
      })


      const table1 = $("#parkingvenueTable").DataTable();

      table1.clear().draw();

      loadData();
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Establishment already exists',
      });
    }
  });
});







