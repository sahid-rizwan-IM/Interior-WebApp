$(document).ready(function () {
    const today = moment().startOf('day');
    $('#startDate').val(today.format('MM-DD-YYYY'));
    $('#endDate').val(today.format('MM-DD-YYYY'));
    $('#startDate').datetimepicker({ format: 'MMM-DD-YYYY' });
    $('#endDate').datetimepicker({ format: 'MMM-DD-YYYY' });
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
        const postObj = {
            clientName,
            projectNo,
            projectName,
            description: $("#description").val().trim(),
            totalAmount,
            startDate,
            endDate
        };

        console.log("Submitting:", postObj);

        $.ajax({
            url: "/api/createProjectList",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(postObj),
            success: function (res) {
                if(res.success === false){
                    $.notify(res.message || "Project created successfully!", { type: "danger" });
                } else {
                    $.notify(res.message || "Project created successfully!", { type: "success" });
                    $("#projectForm")[0].reset();
                    setTimeout(() => {
                        window.location.href = `/api/allMainProjects`;
                    }, 2000);
                }
            },
            error: function (err) {
                $.notify(err.responseJSON?.message || "An error occurred.", { type: "danger" });
            }
        });
    });
});
