'use strict';
module.exports = function (app) {
    var mrController = require('../controller/allcont.js');

    // Memory Book page route
    app.post('/api/userLogin', mrController.userLoginCheck);
    app.get('/api/allMainProjects', mrController.renderProjectList);
    app.get('/api/addNewProject', mrController.addNewProject);
    app.post('/api/createProjectList', mrController.createOrEditProject);
};