const currentProject = JSON.parse($('#currentProject').val());
$(document).ready(function () {
    const today = moment().startOf('day');
    $('#startDate').val(today.format('MM-DD-YYYY'));
    $('#endDate').val(today.format('MM-DD-YYYY'));
    $('#startDate').datetimepicker({ format: 'MMM-DD-YYYY' });
    $('#endDate').datetimepicker({ format: 'MMM-DD-YYYY' });
    document.getElementById('cancelBtn').addEventListener('click', () => {
      window.location.href = '/api/allMainProjects';
    });
    $("#projectForm").submit(function (e) {
        e.preventDefault();

        const clientName = $("#clientName").val().trim();
        const projectNo = $("#projectNo").val().trim();
        const projectName = $("#projectName").val().trim();
        const totalAmount = $("#totalAmount").val().trim();
        const startDate = $("#startDate").val();
        const endDate = $("#endDate").val();


        if (!clientName || !projectNo || !projectName || !totalAmount || !startDate) {
            $.notify("All required fields must be filled!", {
                type: "danger",
                animate: { enter: 'animated bounceInDown', exit: 'animated bounceOutUp' }
            });
            return;
        }

        // If validation passes
        let postObj = {
            clientName,
            projectNo,
            projectName,
            description: $("#description").val().trim(),
            totalAmount,
            startDate,
            endDate
        };
        if (currentProject && currentProject?._id) {
            postObj.projectId = currentProject._id
        }

        console.log("Submitting:", postObj);

        $.ajax({
            url: "/api/createOrEditProjectList",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(postObj),
            success: function (res) {
                if (res.success === false) {
                    $.notify(res.message || "Creation or updation failed!", { type: "danger", animate: { enter: 'animated bounceInDown', exit: 'animated bounceOutUp' }});
                } else {
                    $.notify(res.message || "Project created successfully!", { type: "success", animate: { enter: 'animated bounceInDown', exit: 'animated bounceOutUp' }});
                    $("#projectForm")[0].reset();
                    setTimeout(() => {
                        window.location.href = `/api/allMainProjects`;
                    }, 1000);
                }
            },
            error: function (err) {
                $.notify(err.responseJSON?.message || "An error occurred.", { type: "danger", animate: { enter: 'animated bounceInDown', exit: 'animated bounceOutUp' }});
            }
        });
    });

    if (currentProject && currentProject?._id) {
        $('#startDate').val(moment(currentProject.startDate).format('MMM-DD-YYYY'));
        $('#endDate').val(moment(currentProject.endDate).format('MMM-DD-YYYY'));
    }
});
