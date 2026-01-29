'use strict';
module.exports = function (app) {
    var mrController = require('../controller/allcont.js');

    // Memory Book page route
    app.post('/api/userLogin', mrController.userLoginCheck);

    app.get('/api/allMainProjects', mrController.ensureAuthenticated, mrController.renderProjectList);
    app.get('/api/addNewProject', mrController.ensureAuthenticated, mrController.addNewProject);
    app.post('/api/createOrEditProjectList', mrController.ensureAuthenticated, mrController.createOrEditProject);
    app.delete('/api/deleteProject', mrController.ensureAuthenticated, mrController.deleteProject)

    app.get('/api/logoutUser', mrController.ensureAuthenticated, mrController.logoutUser);

    app.get('/api/viewProject', mrController.ensureAuthenticated, mrController.viewProject);
    app.post('/api/addMaterial', mrController.ensureAuthenticated, mrController.addMaterials);

};