var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    projectlist = mongoose.model('projectlist')
const fs = require("fs");
const path = require("path");
const moment = require("moment");

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
            req.session.user = user; // store user in session
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
                    projectName,
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
                    projectName,
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
            console.log("projectId for delete--==", projectId)

            if (!mongoose.Types.ObjectId.isValid(projectId)) {
                return res.json({ success: false, message: "Invalid Project Id format." });
            }

            const deleteProject = await projectlist.findByIdAndDelete(projectId);
            if (!deleteProject) {
                return res.json({ success: false, message: "Project not found in DB." });
            }
            return res.json({ success: true, message: "Project deleted successfully!" });

        } catch (err) {
            console.warn("ERROR in deleteProject:", err)
            return res.render("addNewProject")
        }
    },

    viewProject: async function(req,res) {
        try {
            const currentProjectDetails = {
                projectId: req.query.id,
                projectName: req.query.projectName,
                clientName: req.query.clientName,
                totalAmount: req.query.amount,
            }
            return res.render("viewProject", { currentProjectDetails })

        } catch (err) {
            console.warn("ERROR in deleteProject:", err)
            return res.render("viewProject")
        }
    }
};

module.exports = mrController;