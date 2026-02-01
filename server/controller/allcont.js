var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    projectlist = mongoose.model('projectlist'),
    materialslist = mongoose.model('materialslist'),
    officeDetails = mongoose.model('officeDetails')
const fs = require("fs");
const path = require("path");
const moment = require("moment");

function capitalizeFirstLetter(str) { 
    if (!str) return str; 
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(); 
}

const mrController = {
    ensureAuthenticated: async function (req, res, next) {
        if (req.session && req.session.user) {
            return next();
        }
        return res.redirect('/');
    },
    userLoginCheck: async function (req, res) {
        try {
            const { userName, userPassword } = req.body;

            const user = await User.findOne({ isActive: true, username: userName });
            if (!user) {
                return res.json({ success: false, message: "User not found!" })
            }

            if (user.password !== userPassword) {
                return res.json({ success: false, message: "Password entered is incorrect!" })
            }
            req.session.user = {
                _id: user._id,
                clientName: user.clientName,
                email: user.email
            };
            return res.json({ success: true, message: "Login successful!" })
        } catch (err) {
            console.warn("ERROR in userLoginCheck:", err.message)
            return res.json({ success: false, message: err.message })
        }
    },

    renderProjectList: async function (req, res) {
        try {
            let fullProjectList = await projectlist.find({ isActive: true }).lean()
            fullProjectList = fullProjectList.map(p => ({
                ...p,
                startDateFormatted: p.startDate ? moment(p.startDate).format("MMM-DD-YYYY") : null,
                endDateFormatted: p.endDate ? moment(p.endDate).format("MMM-DD-YYYY") : null
            })
            );
            return res.render("projectList", {
                projectList: fullProjectList
            })
        } catch (err) {
            console.warn("ERROR in renderProjectList:", err.message)
            return res.render("projectList")
        }
    },

    addNewProject: async function (req, res) {
        try {
            if (req?.query?.id) {
                const editProject = await projectlist.findOne({ _id: req.query.id })
                return res.render("addNewProject",
                    {
                        currentProject: editProject
                    }
                )
            }
            return res.render("addNewProject")
        } catch (err) {
            console.warn("ERROR in addNewProject:", err.message)
            return res.render("addNewProject")
        }
    },

    createOrEditProject: async function (req, res) {
        try {
            const {
                projectId,
                clientName,
                projectNo,
                projectName,
                description,
                totalAmount,
                startDate,
                endDate
            } = req.body;
            if (projectId) {
                const updateDoc = {
                    clientName,
                    projectNo,
                    projectName: capitalizeFirstLetter(projectName),
                    description,
                    totalAmount,
                    startDate,
                    endDate,
                    lastModifiedAt: new Date()
                }
                const response = await projectlist.findByIdAndUpdate(projectId, updateDoc, { new: true })
                if (!response) {
                    return res.json({ success: false, message: "Updation failed!" })
                }
                return res.json({ success: true, message: "Project Updated successfully!" })
            } else {
                const newDoc = {
                    isActive: true,
                    clientName,
                    projectNo,
                    projectName: capitalizeFirstLetter(projectName),
                    description,
                    totalAmount,
                    startDate,
                    endDate,
                    createdBy: req?.user?._id || null,
                    createdAt: new Date(),
                    lastModifiedAt: new Date()
                }

                const response = await projectlist.create(newDoc);
                if (!response) {
                    return res.json({ success: false, message: "Creation failed!" })
                }
                return res.json({ success: true, message: "Project created successfully!" })
            }
        } catch (err) {
            console.warn("ERROR in createOrEditProject:", err.message)
            return res.json({ success: false, message: "Project created failed: err.message" })
        }
    },

    logoutUser: async function (req, res) {
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    },

    deleteProject: async function (req, res) {
        try {
            const { projectId } = req.body;

            if (!mongoose.Types.ObjectId.isValid(projectId)) {
                return res.json({ success: false, message: "Invalid Project Id format." });
            }

            const deleteProject = await projectlist.findByIdAndUpdate(projectId, { isActive: false });
            if (!deleteProject) {
                return res.json({ success: false, message: "Project not found in DB." });
            }
            return res.json({ success: true, message: "Project deleted successfully!" });

        } catch (err) {
            console.warn("ERROR in deleteProject:", err)
            return res.render("addNewProject")
        }
    },

    renderOfficeStore: async function (req, res) {
        try {
            const officeMaterials = await officeDetails.find({ isActive: true }).lean();
            return res.render("officeStore", { renderType: "officeStore", officeStore: officeMaterials })

        } catch (err) {
            console.warn("ERROR in renderOfficeStore:", err)
            return res.render("officeStore")
        }
    },

    viewProject: async function (req, res) {
        try {
            const currentProjectDetails = {
                projectId: req.query.id,
                projectName: req.query.projectName,
                clientName: req.query.clientName,
                totalAmount: req.query.amount,
            }
            const materialList = await materialslist.find({ isActive: true, projectId: new mongoose.Types.ObjectId(req.query.id) }).lean();
            return res.render("viewProject", { currentProjectDetails, materialList, renderType: "viewProject" })

        } catch (err) {
            console.warn("ERROR in deleteProject:", err)
            return res.render("viewProject")
        }
    },

    addMaterials: async function (req, res) {
        try {
            console.log("object got===", req.body);

            if (req.body.collectionType === "officeStore") {
                const {
                    materialName,
                    balanceQuantity,
                    perRate,
                    totalCost,
                    materialId
                } = req.body;

                if (materialId) {
                    const updateDoc = {
                        materialName: capitalizeFirstLetter(materialName),
                        balanceQuantity,
                        perRate,
                        totalCost,
                        lastModifiedAt: new Date()
                    }
                    const response = await officeDetails.findByIdAndUpdate(materialId, updateDoc, { new: true })
                    if (!response) {
                        return res.json({ success: false, message: `Updating ${materialName} failed!` })
                    }
                    return res.json({ success: true, message: `${materialName} Updated successfully!` })
                } else {
                    const newDoc = {
                        isActive: true,
                        materialName: capitalizeFirstLetter(materialName),
                        balanceQuantity,
                        perRate,
                        totalCost,
                        createdBy: req?.user?._id || null,
                        createdAt: new Date(),
                        lastModifiedAt: new Date()
                    }
                    const materialAvail = await officeDetails.findOne({ materialName }).lean();
                    if (materialAvail) {
                        return res.json({ success: false, message: `${materialName} already present, please update there!` })
                    }
                    const response = await officeDetails.create(newDoc);
                    if (!response) {
                        return res.json({ success: false, message: `Adding ${materialName} failed!` })
                    }
                    return res.json({ success: true, message: `${materialName} added successfully!` })
                }

            } else {
                const {
                    materialName,
                    totalQuantity,
                    usedCount,
                    balanceCount,
                    projectId,
                    materialId,
                    usedCountEntered,
                    operator
                } = req.body;

                if (materialId) {
                    const updateDoc = {
                        materialName: capitalizeFirstLetter(materialName),
                        totalQuantity,
                        usedCount,
                        balanceCount,
                        lastModifiedAt: new Date()
                    }
                    const updateOfficeStore = await mrController.updateOfficeStore(materialName, usedCountEntered, operator);
                    if (!updateOfficeStore || updateOfficeStore.success === false) {
                        return res.json({ success: false, message: updateOfficeStore.message })
                    }
                    const response = await materialslist.findByIdAndUpdate(materialId, updateDoc, { new: true });
                    if (!response) {
                        return res.json({ success: false, message: `Updating ${materialName} failed!` })
                    }
                    
                    return res.json({ success: true, message: `${materialName} Updated successfully!` })
                } else {
                    const newDoc = {
                        isActive: true,
                        projectId,
                        materialName: capitalizeFirstLetter(materialName),
                        totalQuantity,
                        usedCount,
                        balanceCount,
                        createdBy: req?.user?._id || null,
                        createdAt: new Date(),
                        lastModifiedAt: new Date()
                    }
                    const materialAvail = await materialslist.findOne({ projectId, materialName }).lean();
                    if (materialAvail) {
                        return res.json({ success: false, message: `${materialName} already present, please update there!` })
                    }
                    const updateOfficeStore = await mrController.updateOfficeStore(materialName, usedCountEntered, operator);
                    if (!updateOfficeStore || updateOfficeStore.success === false) {
                        return res.json({ success: false, message: updateOfficeStore.message })
                    }
                    const response = await materialslist.create(newDoc);
                    if (!response) {
                        return res.json({ success: false, message: `Adding ${materialName} failed!` })
                    }
                    
                    return res.json({ success: true, message: `${materialName} added successfully!` })
                }

            }
        } catch (err) {
            console.warn("ERROR in addMaterials:", err.message)
            return res.json({ success: false, message: `Adding ${materialName} failed: err.message` })
        }
    },

    updateOfficeStore: async function (materialName, usedCountEntered, operator) {
        try {
            const officeDoc = await officeDetails.findOne({ materialName: materialName }).lean();
            if (!officeDoc) {
                return { success: false, message: `${materialName} not found in office store!` };
            }
            const newBalance = operator === "+" ? officeDoc.balanceQuantity - usedCountEntered : Number(officeDoc.balanceQuantity) + Number(usedCountEntered);
            const totalCost = officeDoc.perRate * newBalance;
            const officeResponse = await officeDetails.findByIdAndUpdate(officeDoc._id, { balanceQuantity: newBalance, totalCost }, { new: true });
            if (!officeResponse) {
                return { success: false, message: `Updating ${materialName} in office store failed` };
            }
            return { success: true };
        } catch (err) {
            console.warn("ERROR in updateOfficeStore:", err.message)
            return { success: false, message: `Error Updating ${materialName} in office store failed: ${err.message}` };
        }
    },

    deleteMaterialDoc: async function (req, res) {
        try {
            const { materialId, collectionType } = req.body;

            if (!materialId || !collectionType) {
                return res.json({ success: false, message: "No material Id or collection Type." });
            }

            let deleteMaterial;
            if (collectionType === "officeStore") {
                deleteMaterial = await officeDetails.findByIdAndDelete(materialId);
            } else {
                deleteMaterial = await materialslist.findByIdAndDelete(materialId);
            }

            if (!deleteMaterial) {
                return res.json({ success: false, message: "Material not found in DB." });
            }
            return res.json({ success: true, message: "Material deleted successfully!" });

        } catch (err) {
            console.warn("ERROR in deleteMaterial:", err)
            return  res.json({ success: false, message: err.message });
        }
    }
 };

module.exports = mrController;