export default {
	getFormData() {
		return {
			project_name: inpProjectName.text,
			multiple_locations: swMultipleLocations.isSwitchedOn,
			member_ids: msPeople.selectedOptionValues,
			start_year: Number(numStartYear.text),
			notes: taNotes.text,
		};
	},

	async submit() {
		const data = this.getFormData();

		// 1) require at least one member
		if (!data.member_ids || data.member_ids.length === 0) {
			showAlert("Select at least one lab member.", "warning");
			return;
		}

		// 2) duplicate project name check
		const dup = await no_duplicate_project_name.run({
			project_name: data.project_name,
		});
		if (dup && dup.length > 0) {
			showAlert(
				"A project with this name already exists. Please choose a different name.",
				"warning"
			);
			return;
		}

		try {
			// 3) insert project
			const projectRow = await insert_project_intake.run({
				project_name: data.project_name,
				multiple_locations: data.multiple_locations,
				start_year: data.start_year,
				notes: data.notes,
			});

			const projectId = projectRow[0].project_id;

			// 4) insert junction rows
			await insert_project_members.run({
				project_id_param: projectId,
				member_ids_param: data.member_ids,
			});

			// 5) reset form + notify
			resetWidget("inpIntake_Form", true); // use your actual Form widget name
			showAlert("Project created successfully.", "success");
		} catch (e) {
			showAlert("Error saving project or project members.", "error");
			console.log(e);
		}
	},
};
