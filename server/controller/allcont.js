var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    projectlist = mongoose.model('projectlist')
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const mrController = {
    userLoginCheck: async function (req, res) {
        try {
            const { userName, userPassword } = req.body;
            console.log("body data======", req.body)

            const user = await User.findOne({ isActive: true, username: userName });
            console.log("usersss=", user)
            if (!user) {
                return res.json({ success: false, message: "User not found!" })
            }

            if (user.password !== userPassword) {
                return res.json({ success: false, message: "Password entered is incorrect!" })
            }

            return res.json({ success: true, message: "Login successful!" })
        } catch (err) {
            console.warn("ERROR in userLoginCheck:", err.message)
            return res.json({ success: false, message: err.message })
        }
    },

    renderProjectList: async function(req,res) {
        try{
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
            console.warn("ERROR in userLoginCheck:", err.message)
            return res.render("projectList")
        }
    },

    addNewProject: async function(req,res) {
        try{
            return res.render("addNewProject")
        } catch (err) {
            console.warn("ERROR in userLoginCheck:", err.message)
            return res.render("addNewProject")
        }
    },
    createOrEditProject: async function(req,res) {
        try{
            const {
                clientName,
                projectNo,
                projectName,
                description,
                totalAmount,
                startDate,
                endDate
            } = req.body;

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

            const reponse = await projectlist.create(newDoc)
            return res.json({success: true, message: "Project created successfully!"})
        } catch (err) {
            console.warn("ERROR in userLoginCheck:", err.message)
            return res.json({success: false, message: "Project created failed: err.message"})
        }
    },
};

module.exports = mrController;