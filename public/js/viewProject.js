const renderType = JSON.parse($('#typeName').val());
let currentProjectDetails;

if (renderType === "viewProject") {
    currentProjectDetails = JSON.parse($('#viewedProject').val());
}
const materialList = $('#materialList').val() ? JSON.parse($('#materialList').val()) : '';

$(document).ready(function () {
    $('.btn-delete').on('click', function (e) {
        e.preventDefault();
        document.getElementById('logoutModal').style.display = 'flex';
        const projectId = $(this).data('id');
        const projectName = $(this).data('projectname');

        const alertResponse = alertPopUp("delete", projectId, projectName);
    });

    $(document).on('click', '.edit-material', function () {
        const id = $(this).data('id');
        const name = $(this).data('name');
        const quantity = $(this).data('quantity');
        const used = $(this).data('used');

        addItemsModal(null, id, name, null, quantity, used);
    });

    $(document).on('click', '.edit-officeMaterial', function () {
        const id = $(this).data('id');
        const name = $(this).data('name');
        const quantity = $(this).data('quantity');
        const perRate = $(this).data('perrate');

        addItemsModal("officeStore", id, name, perRate, quantity);
    });

    $(document).on('click', '.delete-material', function () {
        const id = $(this).data('id');
        const collectionType = $(this).data('type');
        const materialName = $(this).data('name');
        document.getElementById('logoutModal').style.display = 'flex';
        console.log("got in delete===", id, "and", materialName, "and", collectionType)

        alertPopUp("delete", id, materialName, collectionType);
    });

});

function alertPopUp(type, projectId = null, projectName = null, collectionType = null) {
    $("#logoutModal").empty()
    let html = `<div class="modal-box">
                <h3>${ projectName !== null ? `Are you sure you want to ${type} ${projectName}?` : `Are you sure you want to ${type}?`}</h3>
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="closeLogoutModal()">Cancel</button>`
    if (type === "logout") {
        html += `<button class="btn-confirm" onclick="confirmLogout()">Yes, ${type}</button>`
    } else if (type === "delete") {
        html += `<button class="btn-confirm" id="confirmDeleteButton">Yes, ${type}</button>`
    }

    html += `   
                </div>
                </div>
            `
    $("#logoutModal").append(html)
    if (type === "delete") {
        console.log("got in type delete===")
        $("#confirmDeleteButton").on("click", function () {
            confirmDelete(projectId, projectName, collectionType);
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

function confirmDelete(id, name, collectionType = null) {
    if (collectionType === "officeStore" || collectionType === "eachProject") {
        $.ajax({
            url: '/api/deleteMaterial',
            type: 'POST',
            data: { materialId: id, collectionType: collectionType },
            success: function (res) {
                if (res.success === true) {
                    $.notify(`${name} deleted successfully!`, { type: "success", animate: { enter: 'animated bounceInDown', exit: 'animated bounceOutUp' } })
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                } else {
                    $.notify(`${name} deletion failed: ${res.message}!`, { type: "danger", animate: { enter: 'animated bounceInDown', exit: 'animated bounceOutUp' } })
                }
            },
            error: function (err) {
                console.error("Error deleting material:", err);
                $.notify(`Error deleting material: ${err.message}!`, { type: "danger", animate: { enter: 'animated bounceInDown', exit: 'animated bounceOutUp' } })
            }
        });
    } else {
        $.ajax({
            url: '/api/deleteProject',
            type: 'POST',
            data: { projectId: id },
            success: function (res) {
                if (res.success === true) {
                    $.notify(`${name} project deleted successfully!`, { type: "success", animate: { enter: 'animated bounceInDown', exit: 'animated bounceOutUp' } })
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                } else {
                    $.notify(`${name} project deletion failed: ${res.message}!`, { type: "danger", animate: { enter: 'animated bounceInDown', exit: 'animated bounceOutUp' } })
                }
            },
            error: function (err) {
                console.error("Error deleting project:", err);
                $.notify(`Error deleting project: ${err.message}!`, { type: "danger", animate: { enter: 'animated bounceInDown', exit: 'animated bounceOutUp' } })
            }
        });
    }
}

function addItemsModal(type = null, materialId = null, name = null, perRate = null, quantity = null, used = null) {
    $("#addItemsModal").empty()
    $("#addItemsModal").css("display", "flex")
    let html = `<div class="form-container modal-box" id="addMaterialForm">
                    <h2>
                        <!-- Replace with JS logic: if currentProject._id exists show "Edit Project", else "New Project Form" -->
                        ${materialId ? "Edit Material" : "Add Material"}
                    </h2>

                    <form id="projectForm">
                        <div class="form-group">
                            <label for="materialName">
                                Material Name <span style="color:red">*</span>
                            </label>
                            <input id="materialName" type="text" name="materialName" placeholder="Enter material name" value="${name ? name : ''}">
                        </div>
                        
                        <div class="form-group">
                            <label for="quantityHave">
                                Quantity <span style="color:red">*</span>
                            </label>
                            <input id="quantityHave" type="number" name="quantityHave" placeholder="Enter quantity" value="0">
                        </div>`
    if (type === "officeStore") {
        html += `
                <div class="form-group">
                    <label for="perRate">
                        Per/Rate <span style="color:red">*</span>
                    </label>
                    <input id="perRate" type="number" name="perRate" placeholder="Enter per/rate" value="${perRate ? perRate : 0}">
                </div>`
    } else {
        html += `
                <div class="form-group">
                    <label for="usedNow">
                        Used <span style="color:red">*</span>
                    </label>
                    <input id="usedNow" type="number" name="usedNow" placeholder="Enter used count" value="0">
                </div>`
    }

    html += `
            <div class="butons">
                <button id="confirmDeleteBtn" type="button">Dismiss</button>`

    if (materialId) {
        html += `
                <button id="subtractBtn" type="button">Subtract</button>`
    }
    html += `
                <button id="submitBtn" type="button">${materialId ? "Update" : "Add"}</button>
            </div>
        </form>
        </div>
    `
    $("#addItemsModal").append(html)
    $("#confirmDeleteBtn").on("click", function () {
        document.getElementById('addItemsModal').style.display = 'none';
    });

    $("#subtractBtn").on("click", function (e) {
        e.preventDefault();
        addOrSubtractCounts("-", type, materialId, quantity, used);

    });

    $("#submitBtn").on("click", function (e) {
        e.preventDefault();
        const materialName = $('#materialName').val();
        console.log("materialName", materialName)
        if (!materialName || materialName === "") {
            return $.notify("Please enter material name", { type: "danger", animate: { enter: 'animated bounceInDown', exit: 'animated bounceOutUp' } });
        }
        addOrSubtractCounts("+", type, materialId, quantity, used);
    });
}

function addOrSubtractCounts(operator, type, materialId, quantity = null, used = null) {
    let postObj;
    const materialName = $('#materialName').val();
    if (type === "officeStore") {
        const balanceQuantity = materialId ? operator === "+" ? Number(quantity) + Number($('#quantityHave').val()) : Number(quantity) - Number($('#quantityHave').val()) : $('#quantityHave').val();
        const perRate = Number($('#perRate').val());
        const totalCost = Number(perRate * balanceQuantity)

        postObj = {
            collectionType: type,
            materialName,
            balanceQuantity,
            perRate,
            totalCost,
            materialId,
        }
    } else {
        const totalQuantity = materialId ? operator === "+" ? Number(quantity) + Number($('#quantityHave').val()) : Number(quantity) - Number($('#quantityHave').val()) : $('#quantityHave').val();
        const usedCount = materialId && used !== null ? operator === "+" ? Number(used) + Number($('#usedNow').val()) : Number(used) - Number($('#usedNow').val()) : $('#usedNow').val();
        const balanceCount = totalQuantity - usedCount

        postObj = {
            projectId: currentProjectDetails.projectId,
            materialName,
            totalQuantity,
            usedCount,
            balanceCount,
            materialId,
            usedCountEntered: Number($('#usedNow').val()),
            operator: operator
        }
    }

    console.log("postObj===", postObj)

    $.ajax({
        url: '/api/addMaterial',
        type: 'POST',
        data: postObj,
        success: function (res) {
            if (res.success === true) {
                $.notify(res.message, { type: "success", animate: { enter: 'animated bounceInDown', exit: 'animated bounceOutUp' } })
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } else {
                $.notify(`Adding ${materialName} material failed- ${res.message}!`, { type: "danger", animate: { enter: 'animated bounceInDown', exit: 'animated bounceOutUp' } })
            }
        },
        error: function (err) {
            console.error("Error adding material:", err);
            $.notify(`Error adding material: ${err.message}!`, { type: "danger", animate: { enter: 'animated bounceInDown', exit: 'animated bounceOutUp' } })
        }
    });
}