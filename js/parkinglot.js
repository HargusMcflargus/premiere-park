let infoWindow, map, center, currentMarker
function initMap() {
	map = new google.maps.Map(document.getElementById("googleMap"), {
		center: { lat: -34.397, lng: 150.644 },
		zoom: 20,
		mapTypeId: "terrain",
	});
	map.addListener("click", (event) => {
		center = { lat: event.latLng.lat(), lng: event.latLng.lng()}
		if (currentMarker) currentMarker.setMap(null)
		currentMarker = new google.maps.Marker({
			position: center,
			map: map
		});
		map.setCenter(center, 12)
	});
	infoWindow = new google.maps.InfoWindow();

	// Try HTML5 geolocation.
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				};
				map.setCenter(pos);
			},
			() => {
				console.log("error")
			}
		);
	} else {
		console.log("error")
	}
}
$(document).ready(function () {
	
	window.initMap = initMap;



	function loadData() {
		// Show the loading indicator
		//  document.getElementById("loading-row").style.display = "table-row";

		// Reset the table data
		table.clear().draw();

		// Fetch data from Firestore
		z = 1;
		parkingslotsRef
			.orderBy("slotnumber", "asc")
			.get()
			.then(function (querySnapshot) {
				querySnapshot.forEach(async (doc) => {
					var ps = doc.data();
					let venueDisplayName = await getVenueDisplayName(
						ps.venueID
					);
					dataSet1 = [
						z,
						doc.id,
						ps.occupant,
						venueDisplayName.name,
						ps.slotnumber,
						ps.status,
					];
					z++;
					table.rows.add([dataSet1]).draw();
				});

				// Hide the loading indicator
				//  document.getElementById("loading-row").style.display = "none";
			});
	}

	function getVenueDisplayName(id) {
		return db
			.collection("venues")
			.doc(id)
			.get()
			.then((document) => {
				return document.data();
			});
	}

	loadData();

	$("#addButton").click((sender) => {
		$("#slotAddress").empty();
		initMap()
		db.collection("venues")
			.get()
			.then((documents) => {
				if (!documents.empty) {
					documents.forEach((doc) => {
						const documentData = doc.data();
						$("#slotAddress").append(
							$("<option>").val(doc.id).text(documentData.name)
						);
					});
				} else {
					$("#editEntryModal").modal("hide");
					Swal.fire({
						title: "No Venue Added",
						icon: "error",
					});
				}
			})
			.catch((error) => {
				$("#editEntryModal").modal("hide");
				Swal.fire({
					title: error,
					icon: "error",
				});
			});
	});

	$("#changeData").on("submit", function (e) {
		e.preventDefault();
		var currentid = $('#changeData input[name="eid"]').val();
		var slotnumber = Number(
			$('#changeData input[name="slotnumberE"]').val()
		);
		var slotowner = $(
			'#changeData select[name="slotownerE"] option:selected'
		).val();
		var status = $('#changeData input[name="statusE"]:checked').val();

		parkingslotsRef
			.doc(currentid)
			.update({
				slotnumber: slotnumber,
				venueID: slotowner,
				status: status,
			})
			.then(function () {
				$("#updateSlotModal").modal("hide");
				Swal.fire({
					icon: "success",
					title: "Record updated successfully",
				});

				$("#parkingslotsTable").DataTable().clear().draw();
				loadData();
			})
			.catch(function (error) {
				console.error("Error updating document: ", error);
			});
	});

	$("#parkingslotsTable").on("click", ".btnDelete", function () {
		Swal.fire({
			title: "Are you sure you want to delete this record?",
			// text: "You won't be able to revert this!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			reverseButtons: true,
			confirmButtonText: "Yes, delete it!",
		}).then((result) => {
			if (result.isConfirmed) {
				var row = $(this).closest("tr");
				var data = table.row(row).data();
				var id = data[1];
				// delete record from Firestore
				parkingslotsRef
					.doc(id)
					.delete()
					.then(function () {
						console.log("Document successfully deleted!");
						const table1 = $("#parkingvenueTable").DataTable();
						table1.clear().draw();
						loadData();
					})
					.catch(function (error) {
						console.error("Error removing document: ", error);
					});
				Swal.fire("Deleted!", "Your file has been deleted.", "success");
			}
		});
	});

	// Add event listeners for edit and delete buttons
	$("#parkingslotsTable").on("click", ".btnEdit", async function () {
		var row = $(this).closest("tr");
		var data = table.row(row).data();
		var id = data[1];

		const venueID = await getSlotData(id);

		var slotnumber = data[4];
		var status = data[5];
		// open edit form and pre-fill fields with current data
		// handle form submission and update Firestore
		$('#changeData input[name="eid"]').val(id);
		// $('#eid').val(id);
		$("#changeData #slotnumberE").val(slotnumber);
		$("#changeData #slotownerE").val(venueID);
		$('#changeData input[name="statusE"][value="' + status + '"]').prop(
			"checked",
			true
		);
		$("#updateSlotModal").modal("show");
	});

	let getSlotData = async (id) => {
		return await db
			.collection("parkingslots")
			.doc(id)
			.get()
			.then((document) => {
				return document.data().venueID;
			});
	};

	// Add an event listener to the input element
	$("#slotc").on("input", function () {
		// Remove any non-numeric characters
		this.value = this.value.replace(/^[0-9]/d, "");
	});

	function checkSlotAvailability(slotnumber) {
		// use where clause to filter documents by slot and floor
		var query = parkingslotsRef.where("slotnumber", "==", slotnumber);

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

		if( !center ){
			Swal.fire({
				icon: "error",
				title: "Select the parking slot on the map",
			});
			return
		}

		// get the values from the form
		var slotnumber = Number($("#slotC").val());

		// check if the slot is available
		checkSlotAvailability(slotnumber).then(function (available) {
			if (available) {
				// add the new document to the collection
				parkingslotsRef.add({
					slotnumber: slotnumber,
					slotType: $('input[name="slotType"]:checked').val(),
					status: $('input[name="type"]:checked').val(),
					occupant: "",
					venueID: $("#slotAddress option:selected").val(),
					reservationList: [],
					location: {
						lng: center.lng,
						lat: center.lat
					},
				});

				// close the modal
				$("#exampleModal1").modal("hide");

				// clear the form values
				$("#slotC").val("");
				$('input[name="type"][value="Type 1"]').prop("checked", true);

				// show a success message

				$("#editEntryModal").modal("hide");

				Swal.fire({
					// position: 'top-mid',
					icon: "success",
					title: "Record added successfully",
				});

				const table1 = $("#parkingslotsTable").DataTable();

				table1.clear().draw();

				loadData();
			} else {
				// show an error message if the slot is already taken
				Swal.fire({
					icon: "error",
					title: "Slot ID already Exists",
				});
			}
		});
	});
	db.collection("venues")
		.orderBy("name", "asc")
		.get()
		.then(function (querySnapshot) {
			querySnapshot.forEach(function (doc) {
				$("#slotownerE").append(
					$("<option>").val(doc.id).text(doc.data().name)
				);
			});
		})
		.catch(function (error) {
			console.log("Error getting documents: ", error);
		});
		
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
var parkingslotsRef = db.collection("parkingslots");
var activeownerRef = db.collection("activeowner");

const editicon =
	'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#f3deba" class="bi bi-pencil-square" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/></svg>';
const deleteicon =
	'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16"><path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/></svg>';

var filleliminate;
var filledit;

var dataSet1 = [];

var table = $("#parkingslotsTable").DataTable({
	pageLength: 5,
	lengthMenu: [
		[5, 10, 20, -1],
		[5, 10, 20, "All"],
	],
	searching: true,
	data: dataSet1,
	columnDefs: [
		{
			targets: 1,
			visible: false,
		},

		{
			targets: -1,
			orderable: false,
			defaultContent:
				"<button class='btnEdit btn btn-success px-2 py-1 mx-2' data-toggle='tooltip' title='Edit'>" +
				"<i class='fa-solid fa-pen fa-sm' style='color: #ffffff;'></i></button>" +
				"<button class='btnDelete btn btn-danger px-2 py-1' data-toggle='tooltip' title='Delete'>" +
				"<i class='fa-solid fa-trash fa-sm' style='color: #ffffff;'></i></button>",
		},
	],
});
