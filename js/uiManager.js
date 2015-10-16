/**
 * 
 */
function UiManager(environment) {
    this.name = "TestUI";
    this.env = environment;
}

UiManager.prototype.testFunction = function () {
    alert("UI manager created");
    this.env.testPrototype("UI manager bound to environment");
};

UiManager.prototype.bindEvents = function () {
    var env = this.env;
    
    $('#btnGenreSearch').bind('vclick', function () {
        var genre = $('#genreSelect').val(),
            numRes = $('#limitSelect').val() * 1;
        env.getArtistsByGenre(genre, numRes);
    });   
};