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

    // basic member check (if required)
    if (!data.member_ids || data.member_ids.length === 0) {
      showAlert("Select at least one lab member.", "warning");
      return;
    }

    // duplicate project name check
    const dup = await no_duplicate_project_name.run({
      project_name: data.project_name,
    });
    if (dup && dup.length > 0) {
      showAlert("A project with this name already exists.", "warning");
      return;
    }

    try {
      // insert project
      const projectRow = await insert_project_intake.run({
        project_name: data.project_name,
        multiple_locations: data.multiple_locations,
        cropping: data.cropping,
        start_year: data.start_year,
        objectives: data.objectives,
        notes: data.notes,
      });

      const projectId = projectRow[0].project_id;

      // insert join rows
      await insert_project_members.run({
        project_id_param: projectId,
        member_ids_param: data.member_ids,
      });

      await insert_project_intake.run();
      resetWidget("Form1", true); // change to your form name
      showAlert("Project created successfully.", "success");
    } catch (e) {
      showAlert("Error saving project or project members.", "error");
      console.log(e);
    }
  },
};
