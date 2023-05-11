Date.prototype.addDays = function (days) {
	var date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
};

$(document).ready(() => {
	let interval;

	$("button").click((sender) => {
		Swal.fire({
			title:
				"Are you sure you want to pay " +
				$(sender.currentTarget).val() / 100 +
				" pesos?",
			text: "There are no refunds",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "Confirm",
		}).then((result) => {
			if (result.isConfirmed) {
				const settings = {
					async: true,
					crossDomain: true,
					url: "https://api.paymongo.com/v1/links",
					method: "POST",
					headers: {
						accept: "application/json",
						"content-type": "application/json",
						authorization:
							"Basic c2tfdGVzdF9HWnBoR1FDbjlKcnN5Z3FpQWNOY2tuY3E6",
					},
					processData: false,
					data:
						'{"data":{"attributes":{"amount":' +
						parseInt($(sender.currentTarget).val()) +
						',"description":"One Time Payment for Premiere Park"}}}',
				};

				$.ajax(settings)
					.then((response) => {
						sessionStorage.setItem(
							"SUBSCRIPTION",
							$(sender.currentTarget).val()
						);
						sessionStorage.setItem(
							"REFERENCE",
							response.data.attributes.reference_number
						);
						window.open(response.data.attributes.checkout_url);
						interval = setInterval(() => {
							const options = {
								method: "GET",
								headers: {
									accept: "application/json",
									authorization:
										"Basic c2tfdGVzdF9HWnBoR1FDbjlKcnN5Z3FpQWNOY2tuY3E6",
								},
							};

							$.ajax(
								"https://api.paymongo.com/v1/links/" +
									response.data.attributes.reference_number,
								options
							)
								.then( (reference) => {
									if (
										reference.data.attributes.status ==
										"paid"
									) {
										const subscriptionStart = new Date();
										const subscriptionEnd =
											subscriptionStart.addDays(25);

										const doStuff = () => {
											db.collection("users")
												.doc(
													sessionStorage.getItem(
														"uid"
													)
												)
												.update({
													subscriptionType:
														sessionStorage.getItem(
															"SUBSCRIPTION"
														) / 100,
													subscriptionDateStart:
														subscriptionStart,
													subscriptionDateEnd:
														subscriptionEnd,
												})
												.then((response) => {
													$("#redirect").toggleClass(
														"d-none"
													);
													window.location.replace(
														"login.html"
													);
												});
										};
										doStuff();
									}
								})
								.catch((err) => console.error(err));
						}, 1000);
					})
					.catch((error) => {
						console.log(error);
					});
			}
		});
	});
});
