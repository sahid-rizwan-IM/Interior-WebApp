const currentProjectDetails = JSON.parse($('#viewedProject').val());
console.log("currentProjectDetails===", currentProjectDetails)

$(document).ready(function () {
    $('.btn-delete').on('click', function (e) {
        e.preventDefault();
        document.getElementById('logoutModal').style.display = 'flex';
        const projectId = $(this).data('id');
        const projectName = $(this).data('projectname');

        const alertResponse = alertPopUp("delete", projectId, projectName);
    });
});

function alertPopUp(type, projectId = null, projectName = null) {
    $("#logoutModal").empty()
    let html = `<div class="modal-box">
                <h3>Are you sure you want to ${type}?</h3>
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="closeLogoutModal()">Dismiss</button>`
    if (type === "logout") {
        html += `<button class="btn-confirm" onclick="confirmLogout()">Yes, ${type}</button>`
    } else if (type === "delete") {
        html += `<button class="btn-confirm" id="confirmDeleteBtn">Yes, ${type}</button>`
    }

    html += `   
                </div>
                </div>
            `
    $("#logoutModal").append(html)
    if (type === "delete") {
        $("#confirmDeleteBtn").on("click", function () {
            confirmDelete(projectId, projectName);
        });
    }
};

function openLogoutModal() {
    document.getElementById('logoutModal').style.display = 'flex';
    $("#logoutModal").empty()
    alertPopUp("logout")
}

function closeLogoutModal(type) {
    document.getElementById('logoutModal').style.display = 'none';
}

function confirmLogout() {
    window.location.href = "/api/logoutUser";
}

function confirmDelete(projectId, projectName) {
    $.ajax({
        url: '/api/deleteProject',
        type: 'DELETE',
        data: { projectId: projectId },
        success: function (res) {
            if (res.success === true) {
                $.notify(`${projectName} project deleted successfully!`, { type: "success" })
                setTimeout(() => {
                    location.reload(); // refresh project list
                }, 1000);
            } else {
                $.notify(`${projectName} project deleted failed- ${res.message}!`, { type: "danger" })
            }
        },
        error: function (err) {
            console.error("Error deleting project:", err);
            $.notify(`ERROR occured - ${err.message}!`, { type: "danger" })
        }
    });
}

function addItemsModal() {
    $("#addItemsModal").empty()
    $("#addItemsModal").css("display", "flex")
    let html = `<div class="form-container" id="addMaterialForm">
                    <h2>
                        <!-- Replace with JS logic: if currentProject._id exists show "Edit Project", else "New Project Form" -->
                        Add Material
                    </h2>

                    <form id="projectForm">
                        <div class="form-group">
                            <label for="materialName">
                                Material Name <span style="color:red">*</span>
                            </label>
                            <input id="materialName" type="text" name="materialName" placeholder="Enter material name" value="">
                        </div>

                        <div class="form-group">
                            <label for="quantityHave">
                                Quantity <span style="color:red">*</span>
                            </label>
                            <input id="quantityHave" type="number" name="quantityHave" placeholder="Enter total quantity" value="">
                        </div>

                        <div class="form-group">
                            <label for="usedNow">
                                Used <span style="color:red">*</span>
                            </label>
                            <input id="usedNow" type="number" name="usedNow" placeholder="Enter used count" value="">
                        </div>

                        <div class="form-group">
                            <label for="balanceIn">
                                Balance <span style="color:red">*</span>
                            </label>
                            <input id="balanceIn" type="number" name="balanceIn" placeholder="Enter balance count" value="">
                        </div>

                        <div class="butons">
                            <button id="confirmDeleteBtn" type="button">Dismiss</button>
                            <button id="submitBtn" type="button" onclick="addMaterial()">Add</button>
                        </div>
                    </form>
                    </div>
            `
    $("#addItemsModal").append(html)
    $("#confirmDeleteBtn").on("click", function () {
        document.getElementById('addItemsModal').style.display = 'none';
    });
}

function addMaterial() {
    console.log("in functionaddd")
    const materialName = $('#materialName').val();
    const totalQuantity = $('#quantityHave').val();
    const usedCount = $('#usedNow').val();
    const balanceCount = $('#balanceIn').val();

    const postObj = {
        projectId: currentProjectDetails.projectId,
        materialName,
        totalQuantity,
        usedCount,
        balanceCount
    }

    console.log("postObj===", postObj)

    $.ajax({
        url: '/api/addMaterial',
        type: 'POST',
        data: postObj,
        success: function (res) {
            if (res.success === true) {
                $.notify(res.message, { type: "success" })
                setTimeout(() => {
                    location.reload(); // refresh view page
                }, 1000);
            } else {
                $.notify(`Adding ${materialName} material failed- ${res.message}!`, { type: "danger" })
            }
        },
        error: function (err) {
            console.error("Error adding material:", err);
            $.notify(`ERROR occured - ${err.message}!`, { type: "danger" })
        }
    });
}