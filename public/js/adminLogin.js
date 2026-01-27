console.log("New script added!!!")

$("#loginForm").submit(function (e) {
    e.preventDefault();
    console.log("in submit")

    const userName = $("#username").val();
    const userPassword = $("#password").val();

    const postObj = {
        userName,
        userPassword
    }
    console.log("post objecttt---", postObj)

    $.ajax({
        url: "/api/userLogin",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(postObj),
        success: function (res) {
            if (res.success === false) {
                $.notify(res.message, { type: "danger", animate: { enter: 'animated bounceInDown', exit: 'animated bounceOutUp' } });
            } else {
                $.notify(res.message, { type: "success", animate: { enter: 'animated bounceInDown', exit: 'animated bounceOutUp' } });
                $("#loginForm")[0].reset();
                setTimeout(() => {
                    window.location.href = `/api/allMainProjects`;
                }, 2000);
            }
        },
        error: function (err) {
            console.log("Error:", err);
            $.notify(err.responseJSON.message || "An unexpected error occurred.", { type: "danger" });
        }
    });
})