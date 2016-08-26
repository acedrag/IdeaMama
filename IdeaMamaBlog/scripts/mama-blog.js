const kinveyBaseUrl = "https://baas.kinvey.com/";
const kinveyAppKey = "kid_SyhXts65";
const kinveyAppSecret = "b0798fc56e85490cbe024efdc1f4efb6";

function showView(viewName) {
    $('main > section').hide();
    $('#' + viewName).show();
}
function showHiddenMenuLinks() {
    $('#linkHome').show();
    if(sessionStorage.getItem('authToken') == null) {
        $('#linkLogin').show();
        $('#linkRegister').show();
        $('#linkListPosts').hide();
        $('#linkCreatePost').hide();
        $('#linkLogout').hide();
    }
    else {
        $('#linkLogin').hide();
        $('#linkRegister').hide();
        $('#linkListPosts').show();
        $('#linkCreatePost').show();
        $('#linkLogout').show();
    }
}
function showInfo(message) {
    $('#infoBox').text(message);
    $('#infoBox').show();
    setTimeout(function () {$('#infoBox').fadeOut()}, 3000);
}
function showError(errorMsg) {
    $('#errorBox').text("Error: " + errorMsg);
    $('#errorBox').show();
}
$(function(){
    showHiddenMenuLinks();
    showView('viewHome');
    $('#linkHome').click(showHomeView);
    $('#linkLogin').click(showLoginView);
    $('#linkRegister').click(showRegisterView);
    $('#linkListPosts').click(listPosts);
    $('#linkCreatePost').click(showCreatePostView);
    $('#linkLogout').click(logout);
    $("#formLogin").submit(function (e) { e.preventDefault(); login(); });
    $("#formRegister").submit(function (e) { e.preventDefault(); register(); });
    $("#formCreatePost").submit(function (e) { e.preventDefault(); createPost(); });
});
$(document).on({
    ajaxStart: function () { $("#loadingBox").show()},
    ajaxStop: function () { $("#loadingBox").hide()}
});
function showHomeView() {
    showView('viewHome');
}
function showLoginView() {
    showView('viewLogin');
}
function login() {
    const kinveyLoginUrl = kinveyBaseUrl + "user/" + kinveyAppKey + "/login";
    const kinveyAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret)
    };
    let userData ={
        username: $('#loginUser').val(),
        password: $('#loginPass').val()
    };
    $.ajax({
        method: "POST",
        url: kinveyLoginUrl,
        headers: kinveyAuthHeaders,
        data: userData,
        success: loginSuccess,
        error: handleAjaxError
    });
    function loginSuccess(response) {
        let userAuth = response._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        showHiddenMenuLinks();
        listBooks();
        showInfo('Login successful.');
    }
}
function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response);
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error.";
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description;
    showError(errorMsg);
}
function showRegisterView() {
    showView('viewRegister')
}
function register() {
    const kinveyRegisterUrl = kinveyBaseUrl + "user/" + kinveyAppKey + "/";
    const kinveyAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret)
    };
    let userData ={
        username: $('#registerUser').val(),
        password: $('#registerPass').val()
    };
    $.ajax({
        method: "POST",
        url: kinveyRegisterUrl,
        headers: kinveyAuthHeaders,
        data: userData,
        success: registerSuccess,
        error: handleAjaxError
    });
    function registerSuccess(response) {
        let userAuth = response._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        showHiddenMenuLinks();
        listPosts();
        showInfo('User registration successful.');
    }
}
function listPosts() {
    $('#posts').empty();
    showView('viewPosts');

    const kinveyPostsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/posts";
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken')
    };
    $.ajax({
        method: "GET",
        url: kinveyPostsUrl,
        headers: kinveyAuthHeaders,
        success: loadPostsSuccess,
        error: handleAjaxError
    });
}
function loadPostsSuccess(posts) {
    showInfo('Posts loaded.');
    if (posts.length == 0) {
        $('#posts').text('No posts in the blog.');
    } else {
        let postsTable = $('<table>')
            .append($('<tr>').append(
                '<th>Title</th>',
                '<th>Author</th>',
                '<th>Description</th>')
            );
        for(let post of posts) {
            postsTable.append($('<tr>').append(
                $('<td>').text(post.title),
                $('<td>').text(post.author),
                $('<td>').text(post.description))
            );
        }
        $('#posts').append(postsTable);
    }
}
function showCreatePostView() {
    showView('viewCreatePost');
}
function createPost() {

    const kinveyPostsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/posts";
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken')
    };
    let postData = {
        title: $('#postTitle').val(),
        author: $('#postAuthor').val(),
        description: $('#postDescription').val()
    };
    $.ajax({
        method: "POST",
        url: kinveyPostsUrl,
        headers: kinveyAuthHeaders,
        data: postData,
        success: createPostSuccess,
        error: handleAjaxError
    });
    function createPostSuccess() {
        listPosts();
        showInfo('Post created.');
    }
}
function logout() {
    sessionStorage.clear();
    showHiddenMenuLinks();
    showView('viewHome');
}
function addPostComment(postData, commentText, commentAuthor) {
    const kinveyPostsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/posts";
    const kinveyHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
        'Content-Type' : 'application/json'
    };
    if (!postData.comments) {
        postData.comments = [];
    }
    postData.comments.push({text: commentText, author: commentAuthor});
    $.ajax({
        method: "PUT",
        url: kinveyPostsUrl + '/' + postData._id,
        headers: kinveyHeaders,
        data: JSON.stringify(postData),
        success: addPostCommentSuccess,
        error: handleAjaxError
    });
    function addPostCommentSuccess(response) {
        listPosts();
        showInfo('Post comment added.');
    }
}
